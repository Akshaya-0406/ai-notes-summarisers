from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="AI Notes Summariser API")

# CORS – for now keep it open, we can tighten later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading summarization model... (Render free tier friendly)")

# 🔥 Use a MUCH smaller model than bart-large-cnn
# This one is lighter and should fit in 512MB:
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6",
)

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
    max_length = min(256, target_sentences * 25)
    min_length = max(20, target_sentences * 8)

    if len(text.split()) > 800:
        text = " ".join(text.split()[:800])

    result = summarizer(
        text,
        max_length=max_length,
        min_length=min_length,
        do_sample=False,
    )
    summary_text = result[0]["summary_text"].strip()
    return SummarizeResponse(summary=summary_text)
