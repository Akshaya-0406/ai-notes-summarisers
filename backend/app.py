from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests

app = FastAPI(title="AI Notes Summariser API (HF-powered)")

# CORS for dev + deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later we can restrict to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 Hugging Face Inference API
HF_API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")


class SummarizeRequest(BaseModel):
    text: str
    max_sentences: int | None = 5


class SummarizeResponse(BaseModel):
    summary: str


@app.get("/")
def root():
    return {"message": "AI Notes Summariser API is running (HF-backed)"}


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest):
    if not HF_API_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="HF_API_TOKEN is not set on the server.",
        )

    text = req.text.strip()
    if not text:
        return SummarizeResponse(summary="Please provide some text to summarise.")

    target_sentences = req.max_sentences or 5
    max_length = min(256, target_sentences * 25)
    min_length = max(20, target_sentences * 8)

    # Truncate extremely long text
    words = text.split()
    if len(words) > 800:
        text = " ".join(words[:800])

    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}"
    }

    payload = {
        "inputs": text,
        "parameters": {
            "max_length": max_length,
            "min_length": min_length,
            "do_sample": False,
        }
    }

    try:
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error calling Hugging Face API: {e}")

    if resp.status_code == 503:
        # Model is loading on HF side
        raise HTTPException(
            status_code=503,
            detail="Model is still loading on Hugging Face. Please try again in a moment.",
        )

    if not resp.ok:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Hugging Face API error: {resp.text}",
        )

    data = resp.json()
    # Expected: [{"summary_text": "..."}]
    try:
        summary_text = data[0]["summary_text"].strip()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected response from Hugging Face: {data}",
        )

    return SummarizeResponse(summary=summary_text)
