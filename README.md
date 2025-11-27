🧠 AI Notes Summariser

A fast and clean AI-powered notes summariser built with React + FastAPI + HuggingFace.
It takes long notes, extracts key ideas, and produces a short, meaningful summary.

🔗 Live App: https://ai-notes-summarisers.vercel.app

🔗 Backend API: https://ai-notes-backend-9x7n.onrender.com

🌟 Features

✅ Summarise long notes using advanced NLP
✅ Clean dark/light theme UI
✅ Fast summarisation using HuggingFace Inference API
✅ Copy-to-clipboard support
✅ Fully mobile responsive
✅ Secure backend with CORS
✅ Deployed on Vercel + Render

🖥️ Tech Stack
Frontend

React (Vite)

Tailwind CSS

Light/Dark Theme Toggle

Fetch API for backend communication

Vercel Deployment

Backend

Python + FastAPI

HuggingFace Router Inference API

Pydantic for validation

CORS Middleware

Render Deployment

📦 Project Structure
ai-notes-summarisers/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── (HF integration)
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── assets/
    ├── package.json
    ├── vite.config.js

🚀 Setup Instructions
1. Clone the Repository
git clone https://github.com/Akshaya-0406/ai-notes-summarisers.git
cd ai-notes-summarisers

🧩 Backend Setup (FastAPI)
Create venv
cd backend
python -m venv venv
venv/Scripts/activate

Install dependencies
pip install -r requirements.txt

Run locally
uvicorn app:app --reload

Environment Variables

In Render → Environment Variables:

HF_API_TOKEN=your_huggingface_token_here

🎨 Frontend Setup (React)
Install
cd frontend
npm install

Run locally
npm run dev

Build
npm run build

🌍 Deployment
Frontend

Deployed using Vercel:

Root Directory: frontend
Build Command: npm run build
Output Directory: dist

Backend

Deployed on Render:

Runtime: Python 3.12+
Start Command:
uvicorn app:app --host 0.0.0.0 --port $PORT

🛡️ Security (CORS)

Backend only allows:

https://ai-notes-summarisers.vercel.app
http://localhost:5173

📝 API Endpoint
POST /summarize
Request Body
{
  "text": "Your long notes...",
  "max_sentences": 3
}

Response
{
  "summary": "Short summary here..."
}

🤝 Contributing

Pull requests are welcome!
If you’d like a new feature (PDF upload, grammar correction, multi-summary, etc.) feel free to open an issue.

🧑‍💻 Author

Akshaya Donthi
AI & ML Engineering Student
GitHub: https://github.com/Akshaya-0406
