# -*- coding: utf-8 -*-
"""
app/core/config.py
------------------
Central configuration: paths, constants used throughout the backend.
All values mirror what rl.py hardcoded.
"""

import os
from pathlib import Path

# ── Project root (rl project/) ───────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ── Storage directories ──────────────────────────────────────────────────────
DATA_DIR    = BASE_DIR / "data"       # downloaded CSVs per ticker
MODEL_DIR   = BASE_DIR / "models"    # saved model files (.zip)
OUTPUT_DIR  = BASE_DIR / "outputs"   # charts, reports

# Ensure they exist on import
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── rl.py constants (do NOT change) ─────────────────────────────────────────
TRAIN_START_DATE  = "2000-01-01"          # historical download start
TRAIN_END_OFFSET_DAYS = 365 * 2          # end = today - 2 years
TRADING_DAYS      = 252
INITIAL_BALANCE   = 10_000

TEST_END_OFFSET_DAYS   = 10              # test end = today - 10 days
TEST_START_OFFSET_DAYS = 365 * 2        # test start = today - 2 years

DEFAULT_ALGORITHM      = "DDPG"
DEFAULT_TIMESTEPS      = 5000
MODEL_FILENAME         = "ddpg_portfolio_management"
PIE_CHART_FILENAME     = "portfolio_allocation.png"
