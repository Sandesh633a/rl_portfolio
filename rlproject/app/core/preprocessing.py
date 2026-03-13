# -*- coding: utf-8 -*-
"""
app/core/preprocessing.py
--------------------------
All data cleaning, alignment, and normalization logic.
Exact translation of rl.py lines 75–416.
No logic changed.
"""

import warnings
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")


# ── Training data preprocessing ──────────────────────────────────────────────

def preprocess_shares(shares: dict) -> dict:
    """
    Clean and align the raw downloaded shares dict.

    Mirrors rl.py lines 75–201:
      1. Add Change column = ((Close - Open) / Open) * 100
      2. Keep only [Close, Change]
      3. Flatten MultiIndex columns if present
      4. Reset index
      5. Remove columns.name
      6. Standardize date formats (share2 uses dayfirst=True)
      7. Align all datasets to common date range
      8. Create Daily Return = Change
    """
    # 1. Add Change column (rl.py line 76)
    for name, data in shares.items():
        data["Change"] = ((data["Close"] - data["Open"]) / data["Open"]) * 100

    # 2. Keep only Close + Change (rl.py line 84)
    for name in shares:
        shares[name] = shares[name][["Close", "Change"]]

    # 3. Flatten MultiIndex columns (rl.py lines 90–93)
    for name, s in shares.items():
        while hasattr(s.columns, "levels") and len(s.columns.levels) > 1:
            s.columns = s.columns.droplevel(1)
        shares[name] = s

    # 4. Reset index (rl.py line 98)
    for name in shares:
        shares[name] = shares[name].reset_index()

    # 5. Remove columns.name (rl.py line 104)
    for name, s in shares.items():
        s.columns.name = None
        shares[name] = s

    # 6. Standardize date formats (rl.py lines 110–117)
    for i, (name, df) in enumerate(shares.items()):
        if i == 1:  # equivalent to share2
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce", dayfirst=True)
        else:
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        shares[name] = df

    # Re-apply standard date parse (rl.py lines 136–140)
    for df in shares.values():
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    # 7. Align by common date range (rl.py lines 144–167)
    common_start_date = max(df["Date"].min() for df in shares.values())
    common_end_date   = min(df["Date"].max() for df in shares.values())

    for name in shares:
        shares[name] = shares[name][
            (shares[name]["Date"] >= common_start_date) &
            (shares[name]["Date"] <= common_end_date)
        ]

    for name in shares:
        shares[name] = shares[name].reset_index(drop=True)

    # 8. Daily Return = Change (rl.py line 171)
    for df in shares.values():
        df["Daily Return"] = df["Change"]

    return shares


def compute_metrics(shares: dict) -> pd.DataFrame:
    """
    Compute average annual return and annualized volatility.
    Mirrors rl.py lines 181–201.
    """
    trading_days = 252

    avg_annual_return = {
        name.upper(): df["Daily Return"].mean() * trading_days
        for name, df in shares.items()
    }
    annualized_volatility = {
        name.upper(): df["Daily Return"].std() * (trading_days ** 0.5)
        for name, df in shares.items()
    }
    metrics_df = pd.DataFrame({
        "Average Annual Return": avg_annual_return,
        "Annualized Volatility": annualized_volatility,
    })
    return metrics_df


def safe_set_index(df: pd.DataFrame, column_name: str = "Date") -> pd.DataFrame:
    """Mirrors rl.py lines 342–345 and 381–384."""
    if column_name in df.columns:
        df[column_name] = pd.to_datetime(df[column_name])
        df.set_index(column_name, inplace=True)
    return df


def build_historical_data(shares: dict) -> pd.DataFrame:
    """
    Build historical_data DataFrame ready for TradingEnv.

    FIXED: Now uses daily-return growth factors (1 + daily_return/100) instead
    of MinMaxScaler-normalized Close prices.

    Why this matters:
      - Old approach: normalized Close prices in [0, 1]
        → dot(prices, allocation) < 1 always
        → portfolio always "shrinks" every step
        → DDPG degenerately puts 100% on highest-normalized asset
      - New approach: growth factors centered around 1.0 (e.g. 0.97–1.03)
        → dot(growth_factors, allocation) ≈ weighted daily portfolio return
        → proper reward signal → DDPG learns real diversified allocations
    """
    # Assert no NaN
    for name, df in shares.items():
        assert not df.isnull().any().any(), f"NaN values found in {name}"

    # Apply safe_set_index to all shares
    for name in shares:
        shares[name] = safe_set_index(shares[name])

    # Build daily-return growth factors: (1 + daily_return_percent / 100)
    # daily_return is already in the "Daily Return" column (= Change in %)
    growth_data = pd.concat(
        [
            (1 + df["Daily Return"] / 100).rename(f"Share{i+1}")
            for i, df in enumerate(shares.values())
        ],
        axis=1,
        join="inner",
    )

    # Clip extreme values (circuit breakers / data errors can cause >±20% days)
    growth_data = growth_data.clip(lower=0.8, upper=1.2)

    # Fill any residual NaN
    growth_data.ffill(inplace=True)
    growth_data.bfill(inplace=True)

    return growth_data


# ── Test data preprocessing ──────────────────────────────────────────────────

def preprocess_test_shares(test_shares: dict) -> dict:
    """
    Clean and align raw test shares dict.
    Mirrors rl.py lines 505–598 (same pipeline as train but for test data).
    """
    # Add Change column (rl.py line 506)
    for name, df in test_shares.items():
        df["Change"] = ((df["Close"] - df["Open"]) / df["Open"]) * 100
        test_shares[name] = df

    # Keep only Close + Change (rl.py line 512)
    for name in test_shares:
        test_shares[name] = test_shares[name][["Close", "Change"]]

    # Flatten MultiIndex columns (rl.py lines 517–521)
    for name, s in test_shares.items():
        while hasattr(s.columns, "levels") and len(s.columns.levels) > 1:
            s.columns = s.columns.droplevel(1)
        test_shares[name] = s

    # Reset index (rl.py line 526)
    for name in test_shares:
        test_shares[name] = test_shares[name].reset_index()

    # Remove columns.name (rl.py line 532)
    for name, df in test_shares.items():
        df.columns.name = None
        test_shares[name] = df

    # Standardize dates (rl.py lines 537–539)
    for df in test_shares.values():
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    # Re-apply date parse (rl.py lines 554–559)
    for df in test_shares.values():
        for col in ["Date"]:
            df[col] = pd.to_datetime(df[col], errors="coerce")

    # Align by common date range (rl.py lines 562–577)
    common_start_date = max(df["Date"].min() for df in test_shares.values())
    common_end_date   = min(df["Date"].max() for df in test_shares.values())

    for name in test_shares:
        test_shares[name] = test_shares[name][
            (test_shares[name]["Date"] >= common_start_date) &
            (test_shares[name]["Date"] <= common_end_date)
        ]

    # Daily Return = Change (rl.py line 583)
    for df in test_shares.values():
        df["Daily Return"] = df["Change"]

    # Set Date as index (rl.py lines 592–598)
    for name, df in test_shares.items():
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        df.set_index("Date", inplace=True)
        test_shares[name] = df

    return test_shares
