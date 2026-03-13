# -*- coding: utf-8 -*-
"""
app/routes/pipeline.py
-----------------------
POST /pipeline/run — Full one-shot pipeline.
GET  /pipeline/session — Last results.
GET  /pipeline/tickers — Last tickers used.
"""

import numpy as np
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional

from app.core.data_handler import fetch_train_shares, fetch_test_shares
from app.core.preprocessing import preprocess_shares, build_historical_data, preprocess_test_shares
from app.core.environment import TradingEnv
from app.core.agent import DRLAgent
from app.core.portfolio import compute_portfolio, run_quantstats, generate_pie_chart
from app.core.config import MODEL_DIR, MODEL_FILENAME, INITIAL_BALANCE, DEFAULT_TIMESTEPS

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

_session: dict = {
    "tickers":    None,
    "algorithm":  "DDPG",
    "allocation": None,
    "action":     None,
    "quantstats": None,
    "chart_b64":  None,
    "trained":    False,
}


class PipelineRequest(BaseModel):
    tickers: List[str] = Field(..., min_length=3, max_length=10)
    algorithm: Optional[str] = Field(default="DDPG")
    total_timesteps: Optional[int] = Field(default=DEFAULT_TIMESTEPS, ge=100)


@router.post("/run", summary="Run full pipeline in one shot")
def run_pipeline(request: PipelineRequest):
    n = len(request.tickers)
    if not (3 <= n <= 10):
        raise HTTPException(status_code=400, detail="Provide 3–10 tickers.")

    # ── 1. Fetch + preprocess training data ───────────────────────────────────
    try:
        shares = fetch_train_shares(request.tickers)
        shares = preprocess_shares(shares)
        historical_data = build_historical_data(shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training data failed: {e}")

    # ── 2. Train ──────────────────────────────────────────────────────────────
    env = TradingEnv(historical_data, initial_balance=INITIAL_BALANCE)
    try:
        agent = DRLAgent(env, algorithm=request.algorithm)
        agent.train(total_timesteps=request.total_timesteps)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")

    model_path = str(MODEL_DIR / MODEL_FILENAME)
    agent.save(model_path)

    # ── 3. Predict (averaged over 50 steps for reliability) ───────────────────
    #   act_averaged() runs env for 50 steps and returns the mean softmax-
    #   normalized weights. This ensures weights sum to EXACTLY 1.0 (100%).
    action = agent.act_averaged(env, n_steps=min(50, len(historical_data) - 1))
    action_list = [float(w) for w in action]

    # Verify total = 100% (should be near-exact due to softmax)
    total = sum(action_list)
    if abs(total - 1.0) > 0.01:
        # Safety re-normalize
        action_list = [w / total for w in action_list]

    allocation = {t: round(float(w), 6) for t, w in zip(request.tickers, action_list)}

    # ── 4. Test data + evaluate ───────────────────────────────────────────────
    try:
        test_shares = fetch_test_shares(request.tickers)
        test_shares = preprocess_test_shares(test_shares)
        portfolio_vals = compute_portfolio(np.array(action_list), test_shares)
        stats = run_quantstats(portfolio_vals)
    except Exception as e:
        stats = {}

    # ── 5. Pie chart ──────────────────────────────────────────────────────────
    try:
        chart_b64 = generate_pie_chart(np.array(action_list), request.tickers)
    except Exception:
        chart_b64 = None

    # ── Store session ─────────────────────────────────────────────────────────
    _session.update({
        "tickers":    request.tickers,
        "algorithm":  request.algorithm,
        "allocation": allocation,
        "action":     action_list,
        "quantstats": stats,
        "chart_b64":  chart_b64,
        "trained":    True,
    })

    return JSONResponse(content={
        "status": "success",
        "tickers": request.tickers,
        "algorithm": request.algorithm,
        "total_timesteps": request.total_timesteps,
        "n_assets": n,
        "allocation": allocation,
        "action": action_list,
        "allocation_pct": {t: round(float(w)*100, 2) for t, w in zip(request.tickers, action_list)},
        "total_weight": round(sum(action_list), 6),
        "quantstats": stats,
        "pie_chart_base64": chart_b64,
        "model_path": model_path + ".zip",
        "message": "Pipeline complete. Weights sum to 100%.",
    })


@router.get("/session", summary="Get last pipeline session results")
def get_session():
    if not _session["trained"]:
        raise HTTPException(status_code=404, detail="No pipeline run yet.")
    return JSONResponse(content={"status": "ok", **{k: v for k, v in _session.items() if v is not None}})


@router.get("/tickers", summary="Get tickers from last session")
def get_tickers():
    if not _session["tickers"]:
        raise HTTPException(status_code=404, detail="No tickers saved.")
    return {"tickers": _session["tickers"], "algorithm": _session["algorithm"]}
