# -*- coding: utf-8 -*-
"""
app/routes/evaluate.py
----------------------
POST /evaluate
  - Downloads test data (last 2yr → last 10 days), replacing old files
  - Preprocesses test data
  - Loads saved action (requires /predict to have been run, or accepts inline action)
  - Computes weighted portfolio returns
  - Returns QuantStats metrics
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.core.data_handler import download_train_shares, download_test_shares
from app.core.preprocessing import preprocess_shares, build_historical_data, preprocess_test_shares
from app.core.environment import TradingEnv
from app.core.agent import DRLAgent
from app.core.portfolio import compute_portfolio, run_quantstats
from app.core.config import MODEL_DIR, MODEL_FILENAME, INITIAL_BALANCE

router = APIRouter(prefix="/evaluate", tags=["Evaluation"])


class EvaluateRequest(BaseModel):
    tickers: List[str] = Field(
        ...,
        min_items=3,
        max_items=10,
        description="List of Yahoo Finance ticker symbols (min 3, max 10).",
    )
    algorithm: Optional[str] = Field(
        default="DDPG",
        description="Algorithm of the saved model: 'DDPG' or 'PPO'.",
    )


class EvaluateResponse(BaseModel):
    status: str
    tickers: List[str]
    action: List[float]
    allocation: dict
    quantstats: dict


@router.post("/", response_model=EvaluateResponse, summary="Evaluate trained model on test data with QuantStats")
def evaluate(request: EvaluateRequest):
    """
    Full evaluation pipeline:

    1. Download test data (today−2yr → today−10d), replacing old files  
    2. Preprocess test data (Change, align dates, Daily Return, set Date index)  
    3. Re-derive action from saved model on training env  
    4. Compute portfolio = Σ action[i] × test_share[i]["Close"]  
    5. Run QuantStats metrics (Sharpe, Sortino, Calmar, MaxDrawdown, CAGR, Volatility)  
    6. Compare against Nifty 50 benchmark  

    Mirrors rl.py lines 480–629.
    """
    model_path = str(MODEL_DIR / MODEL_FILENAME)

    # Step 1+2: Training data → env → action (need trained model for allocations)
    try:
        train_shares = download_train_shares(request.tickers)
        train_shares = preprocess_shares(train_shares)
        historical_data = build_historical_data(train_shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training data preparation failed: {str(e)}")

    env = TradingEnv(historical_data, initial_balance=INITIAL_BALANCE)

    try:
        agent = DRLAgent(env, algorithm=request.algorithm)
        agent.load(model_path)
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Model not found. Please run /train first. Error: {str(e)}",
        )

    observation = env.reset()
    action = agent.act(observation)

    # Step 3: Download + preprocess test data (replaces old test CSVs)
    try:
        test_shares = download_test_shares(request.tickers)
        test_shares = preprocess_test_shares(test_shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test data preparation failed: {str(e)}")

    # Step 4: Compute portfolio (rl.py lines 602–609)
    try:
        portfolio = compute_portfolio(action, test_shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio computation failed: {str(e)}")

    # Step 5: Run QuantStats (rl.py lines 614–629)
    try:
        stats = run_quantstats(portfolio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QuantStats evaluation failed: {str(e)}")

    action_list = action.tolist()
    allocation = {ticker: round(float(w), 6) for ticker, w in zip(request.tickers, action_list)}

    return EvaluateResponse(
        status="success",
        tickers=request.tickers,
        action=action_list,
        allocation=allocation,
        quantstats=stats,
    )
