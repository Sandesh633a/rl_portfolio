# -*- coding: utf-8 -*-
"""
app/core/portfolio.py
---------------------
Portfolio computation, QuantStats evaluation, and pie chart generation.
Exact translation of rl.py lines 602–665.
No logic changed.
"""

import io
import base64
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")          # non-interactive backend
import matplotlib.pyplot as plt
import quantstats as qs
from datetime import datetime, timedelta
from pathlib import Path

warnings.filterwarnings("ignore")

from app.core.config import OUTPUT_DIR, PIE_CHART_FILENAME, TEST_END_OFFSET_DAYS, TEST_START_OFFSET_DAYS


def compute_portfolio(action: np.ndarray, test_shares: dict) -> pd.Series:
    """
    Compute weighted portfolio returns from test data.

    Mirrors rl.py lines 602–609:
      portfolio = sum(action[i] * shares_list[i]["Close"])
    """
    shares_list = list(test_shares.values())
    portfolio = sum(
        action[i] * shares_list[i]["Close"]
        for i in range(len(shares_list))
    )
    return portfolio


def compute_sharpe(portfolio: pd.Series) -> float:
    """
    Compute Sharpe ratio for the portfolio.
    Mirrors rl.py line 615: qs.stats.sharpe(portfolio)
    """
    return float(qs.stats.sharpe(portfolio))


def run_quantstats(portfolio: pd.Series) -> dict:
    """
    Download benchmark (Nifty 50) returns, filter to matching date range,
    and compute key QuantStats metrics.

    Mirrors rl.py lines 617–629.

    Returns a dict with common stats (JSON-serializable).
    """
    end_date   = datetime.today() - timedelta(days=TEST_END_OFFSET_DAYS)
    start_date = datetime.today() - timedelta(days=TEST_START_OFFSET_DAYS)

    stock = qs.utils.download_returns("^NSEI")
    stock = stock.loc[start_date:end_date]

    stats = {
        "sharpe":         float(qs.stats.sharpe(portfolio)),
        "sortino":        float(qs.stats.sortino(portfolio)),
        "max_drawdown":   float(qs.stats.max_drawdown(portfolio)),
        "calmar":         float(qs.stats.calmar(portfolio)),
        "volatility":     float(qs.stats.volatility(portfolio)),
        "cagr":           float(qs.stats.cagr(portfolio)),
        "benchmark_sharpe": float(qs.stats.sharpe(stock)) if not stock.empty else None,
    }
    return stats


def generate_pie_chart(weights: np.ndarray, tickers: list[str]) -> str:
    """
    Generate a portfolio allocation pie chart, save PNG to outputs/,
    and return it as a base64-encoded string.

    Mirrors rl.py lines 632–665 (exact same plot parameters).
    Returns base64 string of the PNG image.
    """
    # Remove near-zero allocations (rl.py line 639)
    mask = weights > 0.001
    weights_filtered = weights[mask]
    tickers_filtered = np.array(tickers)[mask]

    # Warm colors (rl.py line 644)
    colors = ['#ff9999', '#ffcc99', '#ffd966', '#ffb366', '#ff8c66', '#ff7f7f', '#ffaa55', '#ffe066', '#ff9966', '#ff8080']
    colors = colors[:len(weights_filtered)]

    fig, ax = plt.subplots(figsize=(7, 7))
    ax.pie(
        weights_filtered,
        labels=tickers_filtered,
        colors=colors,
        autopct='%1.2f%%',
        startangle=90,
        pctdistance=0.6,
        labeldistance=1.1,
        wedgeprops={'edgecolor': 'white', 'linewidth': 2},
        textprops={'fontsize': 11},
    )
    ax.set_title("Recommended Portfolio Allocation", fontsize=16, fontweight='bold')
    ax.axis('equal')
    plt.tight_layout()

    # Save to disk (outputs/)
    chart_path = OUTPUT_DIR / PIE_CHART_FILENAME
    plt.savefig(chart_path, format="png", bbox_inches="tight")
    plt.close(fig)

    # Also return as base64 for API response
    buf = io.BytesIO()
    fig2, ax2 = plt.subplots(figsize=(7, 7))
    ax2.pie(
        weights_filtered,
        labels=tickers_filtered,
        colors=colors,
        autopct='%1.2f%%',
        startangle=90,
        pctdistance=0.6,
        labeldistance=1.1,
        wedgeprops={'edgecolor': 'white', 'linewidth': 2},
        textprops={'fontsize': 11},
    )
    ax2.set_title("Recommended Portfolio Allocation", fontsize=16, fontweight='bold')
    ax2.axis('equal')
    plt.tight_layout()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig2)

    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    return img_base64
