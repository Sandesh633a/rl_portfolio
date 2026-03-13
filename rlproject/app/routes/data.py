# -*- coding: utf-8 -*-
"""
app/routes/data.py
------------------
POST /data/download
  - Accept list of tickers
  - Delete old CSVs, download fresh data
  - Return confirmation and preview
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.core.data_handler import download_train_shares

router = APIRouter(prefix="/data", tags=["Data"])


class DownloadRequest(BaseModel):
    tickers: List[str] = Field(
        ...,
        min_items=3,
        max_items=10,
        description="List of Yahoo Finance ticker symbols (min 3, max 10). Example: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS']",
    )


class DownloadResponse(BaseModel):
    status: str
    message: str
    shares_downloaded: int
    tickers: List[str]
    rows_per_share: dict


@router.post("/download", response_model=DownloadResponse, summary="Download (or re-download) stock data")
def download_data(request: DownloadRequest):
    """
    Downloads historical stock data from Yahoo Finance for each ticker.

    **Data replace policy**: If a CSV file already exists for a ticker on disk,
    it is **deleted first**, then fresh data is downloaded. This prevents disk
    from filling up with stale data.

    - start_date: 2000-01-01
    - end_date: today − 2 years
    - interval: 1d
    """
    n = len(request.tickers)
    if n < 3 or n > 10:
        raise HTTPException(status_code=400, detail="Number of tickers must be between 3 and 10.")

    try:
        shares = download_train_shares(request.tickers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data download failed: {str(e)}")

    rows_per_share = {name: len(df) for name, df in shares.items()}

    return DownloadResponse(
        status="success",
        message=f"Downloaded fresh data for {n} ticker(s). Old files replaced.",
        shares_downloaded=n,
        tickers=request.tickers,
        rows_per_share=rows_per_share,
    )
