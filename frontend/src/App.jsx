// frontend/src/App.jsx
import React, { useEffect, useState } from "react";

const API_URL = "https://ai-notes-backend-9x7n.onrender.com/summarize";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [text, setText] = useState("");
  const [maxSentences, setMaxSentences] = useState(5);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // handle theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSummarise = async () => {
    setError("");
    setSummary("");
    setCopied(false);

    if (!text.trim()) {
      setError("Please paste or type some notes first.");
      return;
    }

    if (wordCount < 30) {
      setError("Try giving at least ~30–40 words for a better summary.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          max_sentences: Number(maxSentences),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          typeof data.detail === "string"
            ? data.detail
            : "Server error, please try again.";
        throw new Error(msg);
      }

      const data = await res.json();
      setSummary(data.summary || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setSummary("");
    setError("");
    setCopied(false);
  };

  const fillSample = () => {
    const sample =
      "Artificial Intelligence (AI) is transforming many industries, including healthcare, education, and finance. " +
      "In healthcare, AI helps doctors analyse scans and detect diseases earlier. In education, AI tools support personalised learning " +
      "by recommending content based on each student’s pace. However, AI also raises important questions about privacy, bias, and job " +
      "replacement. Understanding both the benefits and risks of AI is essential so that we can use this technology responsibly and " +
      "build systems that are fair, transparent, and helpful for everyone.";
    setText(sample);
    setSummary("");
    setError("");
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      setError("Could not copy to clipboard.");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-title">
          <div className="logo-circle">AI</div>
          <div>
            <h1>AI Notes Summariser</h1>
            <p className="subtitle">
              Paste your messy notes. Get a clean, short summary in seconds.
            </p>
          </div>
        </div>

        <button
          className="theme-toggle"
          onClick={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        >
          {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
        </button>
      </header>

      <main className="main-grid big-layout">
        {/* INPUT CARD */}
        <section className="card tall-card">
          <div className="card-header">
            <div className="card-title-row">
              <h2>Your Notes</h2>
              <span className="pill pill-soft">Input</span>
            </div>
            <div className="header-actions">
              <button className="ghost-btn" onClick={fillSample}>
                Fill sample
              </button>
              <button className="ghost-btn" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>

          <textarea
            className="notes-input big-input"
            placeholder="Paste your lecture notes, textbook content, or any long text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="meta-row">
            <div className="word-counter">
              <span>{wordCount} words</span>
              <span className="hint">
                {wordCount === 0
                  ? "Tip: paste a paragraph or two."
                  : wordCount < 40
                  ? "More text = better summary."
                  : wordCount > 600
                  ? "Very long — I’ll truncate a bit."
                  : "Nice length for a summary."}
              </span>
            </div>
          </div>

          <div className="controls-row">
            <div className="control">
              <label>Summary length</label>
              <select
                value={maxSentences}
                onChange={(e) => setMaxSentences(e.target.value)}
              >
                <option value={3}>Ultra short (~3 sentences)</option>
                <option value={5}>Short (~5 sentences)</option>
                <option value={8}>Medium (~8 sentences)</option>
                <option value={12}>Detailed (~12 sentences)</option>
              </select>
            </div>

            <button
              className="primary-btn big-primary"
              onClick={handleSummarise}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "✨ Summarise my notes"}
            </button>
          </div>

          {error && <div className="error-msg">{error}</div>}
        </section>

        {/* OUTPUT CARD */}
        <section className="card tall-card">
          <div className="card-header">
            <div className="card-title-row">
              <h2>Summary</h2>
              <span className="pill pill-outline">Output</span>
            </div>

            <div className="header-actions">
              {summary && (
                <button className="ghost-btn" onClick={handleCopy}>
                  📋 Copy
                </button>
              )}
              {copied && <span className="chip chip-success">Copied!</span>}
            </div>
          </div>

          {loading && (
            <div className="loading-state centered-loading">
              <div className="big-spinner" />
              <p>Thinking through your notes and condensing the key ideas…</p>
            </div>
          )}

          {!loading && summary && (
            <div className="summary-box big-summary">
              {summary.split("\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          )}

          {!loading && !summary && !error && (
            <div className="empty-state centered-loading">
              <p>
                Your summary will appear here. Paste some notes and click{" "}
                <strong>“Summarise my notes”</strong> to get started.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Built with 🧠 FastAPI + HuggingFace + React</p>
      </footer>
    </div>
  );
}
