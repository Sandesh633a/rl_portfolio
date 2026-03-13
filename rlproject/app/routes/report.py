# -*- coding: utf-8 -*-
"""
app/routes/report.py
--------------------
GET /report
  - Loads the last computed action from recent predict call
  - Generates pie chart (base64 PNG)
  - Returns full QuantStats stats + pie chart

POST /report/generate
  - End-to-end: train data → model → test data → portfolio → full report
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional

from app.core.data_handler import download_train_shares, download_test_shares
from app.core.preprocessing import preprocess_shares, build_historical_data, preprocess_test_shares
from app.core.environment import TradingEnv
from app.core.agent import DRLAgent
from app.core.portfolio import compute_portfolio, run_quantstats, generate_pie_chart
from app.core.config import MODEL_DIR, MODEL_FILENAME, INITIAL_BALANCE, OUTPUT_DIR, PIE_CHART_FILENAME

router = APIRouter(prefix="/report", tags=["Report"])


class ReportRequest(BaseModel):
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


@router.post("/generate", summary="Generate complete report: QuantStats + Pie Chart")
def generate_report(request: ReportRequest):
    """
    End-to-end report generation:

    1. Download training data (replaces old files)
    2. Preprocess + build normalized historical_data
    3. Load trained DDPG model, get allocation action
    4. Download test data (replaces old files)
    5. Compute weighted portfolio
    6. Run QuantStats vs Nifty 50
    7. Generate pie chart → save to outputs/ + return as base64
    8. Return JSON with all stats and chart

    Mirrors the full rl.py post-training flow (lines 480–665).
    """
    model_path = str(MODEL_DIR / MODEL_FILENAME)

    # Training data pipeline
    try:
        train_shares = download_train_shares(request.tickers)
        train_shares = preprocess_shares(train_shares)
        historical_data = build_historical_data(train_shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training data failed: {str(e)}")

    env = TradingEnv(historical_data, initial_balance=INITIAL_BALANCE)

    try:
        agent = DRLAgent(env, algorithm=request.algorithm)
        agent.load(model_path)
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Model not found. Please run POST /train first. Error: {str(e)}",
        )

    observation = env.reset()
    action = agent.act(observation)

    # Test data pipeline
    try:
        test_shares = download_test_shares(request.tickers)
        test_shares = preprocess_test_shares(test_shares)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test data failed: {str(e)}")

    # Portfolio + QuantStats
    try:
        portfolio = compute_portfolio(action, test_shares)
        stats = run_quantstats(portfolio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

    # Pie chart (rl.py lines 632–665)
    try:
        chart_b64 = generate_pie_chart(action, request.tickers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")

    action_list = action.tolist()
    allocation = {ticker: round(float(w), 6) for ticker, w in zip(request.tickers, action_list)}

    return JSONResponse(content={
        "status": "success",
        "tickers": request.tickers,
        "allocation": allocation,
        "action": action_list,
        "quantstats": stats,
        "chart_saved_at": str(OUTPUT_DIR / PIE_CHART_FILENAME),
        "pie_chart_base64": chart_b64,
        "message": "Full report generated. Pie chart saved to outputs/ and returned as base64.",
    })


@router.get("/chart-path", summary="Get path to saved pie chart")
def chart_path():
    """
    Returns the file path of the most recently generated pie chart.
    """
    path = OUTPUT_DIR / PIE_CHART_FILENAME
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="No chart found. Please run POST /report/generate first.",
        )
    return {"chart_path": str(path)}
