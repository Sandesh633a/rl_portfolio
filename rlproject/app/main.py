# -*- coding: utf-8 -*-
"""
app/main.py — FastAPI entry point. All routers registered here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import data, train, predict, evaluate, report, pipeline

app = FastAPI(
    title="RL Portfolio Management API",
    description=(
        "Deep Reinforcement Learning portfolio optimization backend.\n\n"
        "**Primary workflow (one-shot):**\n"
        "- `POST /pipeline/run` — Full pipeline in a single call\n\n"
        "**Individual routes still available for granular control.**"
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipeline.router)
app.include_router(data.router)
app.include_router(train.router)
app.include_router(predict.router)
app.include_router(evaluate.router)
app.include_router(report.router)


@app.get("/health", tags=["Health"], summary="Health check")
def health():
    return {"status": "ok", "service": "RL Portfolio Management API v2"}


@app.get("/", tags=["Health"], summary="Root")
def root():
    return {
        "message": "RL Portfolio API v2 running.",
        "docs": "/docs",
        "primary_route": "POST /pipeline/run",
    }
