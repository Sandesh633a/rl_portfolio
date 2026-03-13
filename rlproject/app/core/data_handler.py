# -*- coding: utf-8 -*-
"""
app/core/data_handler.py
------------------------
Fetches stock data from Yahoo Finance purely in-memory.
No files are written or read from disk — data flows directly through the pipeline.
"""

import warnings
import yfinance as yf
from datetime import datetime, timedelta

warnings.filterwarnings("ignore")

from app.core.config import (
    TRAIN_START_DATE,
    TRAIN_END_OFFSET_DAYS,
    TEST_END_OFFSET_DAYS,
    TEST_START_OFFSET_DAYS,
)


def fetch_train_shares(tickers: list[str]) -> dict:
    """
    Fetch historical training data for each ticker directly into memory.
    No files written to disk.

    Date range:
      - start: 2000-01-01
      - end: today − 2 years
      - interval: 1d

    Returns
    -------
    shares : dict  {"share1": DataFrame, "share2": DataFrame, ...}
    """
    end_date = datetime.today() - timedelta(days=TRAIN_END_OFFSET_DAYS)
    start_date = TRAIN_START_DATE

    shares = {}
    for i, ticker in enumerate(tickers, start=1):
        data = yf.download(
            tickers=ticker,
            start=start_date,
            end=end_date.strftime("%Y-%m-%d"),
            interval="1d",
            progress=False,
        ).dropna()
        shares[f"share{i}"] = data

    return shares


def fetch_test_shares(tickers: list[str]) -> dict:
    """
    Fetch recent test data for each ticker directly into memory.
    No files written to disk.

    Date range:
      - start: today − 2 years
      - end: today − 10 days
      - interval: 1d

    Returns
    -------
    test_shares : dict  {"share1_test_data": DataFrame, ...}
    """
    end_date   = datetime.today() - timedelta(days=TEST_END_OFFSET_DAYS)
    start_date = datetime.today() - timedelta(days=TEST_START_OFFSET_DAYS)

    test_shares = {}
    for i, ticker in enumerate(tickers, start=1):
        data = yf.download(
            tickers=ticker,
            start=start_date.strftime("%Y-%m-%d"),
            end=end_date.strftime("%Y-%m-%d"),
            interval="1d",
            progress=False,
        ).dropna()
        test_shares[f"share{i}_test_data"] = data

    return test_shares


# Keep old names as aliases so existing route files don't need changes
download_train_shares = fetch_train_shares
download_test_shares  = fetch_test_shares
