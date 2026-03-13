# -*- coding: utf-8 -*-
"""
app/routes/train.py
-------------------
POST /train
  - Downloads training data
  - Runs full preprocessing pipeline
  - Trains DRL agent (DDPG by default)
  - Saves model to models/
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.core.data_handler import download_train_shares
from app.core.preprocessing import preprocess_shares, build_historical_data
from app.core.environment import TradingEnv
from app.core.agent import DRLAgent
from app.core.config import MODEL_DIR, MODEL_FILENAME, INITIAL_BALANCE, DEFAULT_TIMESTEPS

router = APIRouter(prefix="/train", tags=["Training"])


class TrainRequest(BaseModel):
    tickers: List[str] = Field(
        ...,
        min_items=3,
        max_items=10,
        description="List of Yahoo Finance ticker symbols (min 3, max 10).",
    )
    algorithm: Optional[str] = Field(
        default="DDPG",
        description="RL algorithm to use: 'DDPG' or 'PPO'.",
    )
    total_timesteps: Optional[int] = Field(
        default=DEFAULT_TIMESTEPS,
        ge=100,
        description="Number of training timesteps.",
    )


class TrainResponse(BaseModel):
    status: str
    message: str
    model_path: str
    algorithm: str
    total_timesteps: int
    n_assets: int
    observation_space_shape: list


@router.post("/", response_model=TrainResponse, summary="Train DRL agent on historical data")
def train_agent(request: TrainRequest):
    """
    Full training pipeline:

    1. Download historical data (2000 → today − 2yr), replacing old files
    2. Preprocess: Change col, date alignment, Daily Return
    3. Build normalized historical_data (MinMaxScaler on Close prices)
    4. Create TradingEnv with initial_balance=10,000
    5. Instantiate DRLAgent (DDPG or PPO)
    6. Train for `total_timesteps` steps
    7. Save model to `models/ddpg_portfolio_management`
    """
    n = len(request.tickers)
    if n < 3 or n > 10:
        raise HTTPException(status_code=400, detail="Number of tickers must be between 3 and 10.")

    # Step 1: Download (replaces old data)
    try:
        shares = download_train_shares(request.tickers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data download failed: {str(e)}")

    # Step 2: Preprocess
    try:
        shares = preprocess_shares(shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

    # Step 3: Build historical_data
    try:
        historical_data = build_historical_data(shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Building historical data failed: {str(e)}")

    # Step 4: Create env
    env = TradingEnv(historical_data, initial_balance=INITIAL_BALANCE)

    # Step 5: Initialize agent
    try:
        agent = DRLAgent(env, algorithm=request.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Step 6: Train
    try:
        agent.train(total_timesteps=request.total_timesteps)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

    # Step 7: Save model
    model_path = str(MODEL_DIR / MODEL_FILENAME)
    agent.save(model_path)

    return TrainResponse(
        status="success",
        message="Agent trained and model saved successfully.",
        model_path=model_path + ".zip",
        algorithm=request.algorithm,
        total_timesteps=request.total_timesteps,
        n_assets=n,
        observation_space_shape=list(env.observation_space.shape),
    )
