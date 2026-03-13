#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
run.py
------
Start the FastAPI server with uvicorn.

Usage:
    python run.py

Then open:
    http://localhost:8000/docs      ← Interactive Swagger UI
    http://localhost:8000/redoc     ← ReDoc documentation
    http://localhost:8000/health    ← Health check
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,            # auto-reload on code changes (dev mode)
        log_level="info",
    )
