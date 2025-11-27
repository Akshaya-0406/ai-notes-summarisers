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
@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest):
    print("📌 Summarize endpoint hit!")

    if not HF_API_TOKEN:
        print("❌ HF_API_TOKEN is missing!")
        raise HTTPException(
            status_code=500,
            detail="HF_API_TOKEN is not set"
        )

    text = req.text.strip()
    if not text:
        return SummarizeResponse(summary="Please provide some text.")

    target_sentences = req.max_sentences or 5
    max_length = min(256, target_sentences * 25)
    min_length = max(20, target_sentences * 8)

    if len(text.split()) > 800:
        text = " ".join(text.split()[:800])

    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

    payload = {
        "inputs": text,
        "parameters": {
            "max_length": max_length,
            "min_length": min_length,
            "do_sample": False,
        }
    }

    print("📤 Sending request to HuggingFace model...")
    resp = requests.post(HF_API_URL, headers=headers, json=payload)

    print("📥 Raw HF response:")
    print(resp.text)

    if not resp.ok:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"HF Error: {resp.text}"
        )

    try:
        data = resp.json()
        summary_text = data[0]["summary_text"]
        return SummarizeResponse(summary=summary_text)
    except Exception as e:
        print("❌ Failed to parse HF response:", e)
        return SummarizeResponse(summary="HF returned unexpected response format.")
