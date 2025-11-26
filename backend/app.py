from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import os

app = FastAPI(title="AI Notes Summariser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ok for now (dev/demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading summarization model... (first time will be slow)")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
print("Model loaded!")


class SummarizeRequest(BaseModel):
    text: str
    max_sentences: int | None = 5


class SummarizeResponse(BaseModel):
    summary: str


@app.get("/")
def root():
    return {"message": "AI Notes Summariser API is running"}


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest):
    text = req.text.strip()
    if not text:
        return SummarizeResponse(summary="Please provide some text to summarise.")

    target_sentences = req.max_sentences or 5
    max_length = min(512, target_sentences * 30)
    min_length = max(30, target_sentences * 10)

    if len(text.split()) > 1200:
        text = " ".join(text.split()[:1200])

    result = summarizer(
        text,
        max_length=max_length,
        min_length=min_length,
        do_sample=False,
    )
    summary_text = result[0]["summary_text"].strip()
    return SummarizeResponse(summary=summary_text)


# ⚠️ Render will run using uvicorn with $PORT (we handle that in command, not here)
