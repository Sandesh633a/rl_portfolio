# -*- coding: utf-8 -*-
"""
app/routes/predict.py
---------------------
POST /predict — Get softmax-normalized portfolio allocation from trained model.

FIX: Uses agent.act_averaged() (50-step warm-up) so weights always sum to 1.0 (100%).
"""

import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.core.data_handler import fetch_train_shares
from app.core.preprocessing import preprocess_shares, build_historical_data
from app.core.environment import TradingEnv
from app.core.agent import DRLAgent
from app.core.config import MODEL_DIR, MODEL_FILENAME, INITIAL_BALANCE

router = APIRouter(prefix="/predict", tags=["Prediction"])


class PredictRequest(BaseModel):
    tickers: List[str] = Field(..., min_length=3, max_length=10)
    algorithm: Optional[str] = Field(default="DDPG")


class PredictResponse(BaseModel):
    status: str
    action: List[float]
    allocation: dict
    allocation_pct: dict
    total_weight: float
    message: str


@router.post("/", response_model=PredictResponse, summary="Get portfolio allocation (weights sum to 100%)")
def predict(request: PredictRequest):
    model_path = str(MODEL_DIR / MODEL_FILENAME)

    # Rebuild env from fresh data
    try:
        shares = fetch_train_shares(request.tickers)
        shares = preprocess_shares(shares)
        historical_data = build_historical_data(shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data preparation failed: {str(e)}")

    env = TradingEnv(historical_data, initial_balance=INITIAL_BALANCE)

    # Load model
    try:
        agent = DRLAgent(env, algorithm=request.algorithm)
        agent.load(model_path)
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Model not found. Run /train or /pipeline/run first. Error: {str(e)}",
        )

    # act_averaged: run 50 steps, average softmax weights → always sums to 1.0
    n_steps = min(50, len(historical_data) - 1)
    action = agent.act_averaged(env, n_steps=n_steps)
    action_list = [float(w) for w in action]

    # Safety re-normalize
    total = sum(action_list)
    if abs(total - 1.0) > 0.001:
        action_list = [w / total for w in action_list]

    allocation     = {t: round(float(w), 6)       for t, w in zip(request.tickers, action_list)}
    allocation_pct = {t: round(float(w) * 100, 2) for t, w in zip(request.tickers, action_list)}

    return PredictResponse(
        status="success",
        action=action_list,
        allocation=allocation,
        allocation_pct=allocation_pct,
        total_weight=round(sum(action_list), 6),
        message=f"Weights sum to {round(sum(action_list)*100, 2)}%.",
    )
