import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [maxSentences, setMaxSentences] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark"); // "dark" | "light"
  const [copied, setCopied] = useState(false);

  // Uses env var in production, falls back to localhost for dev
  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/summarize";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);

    if (!text.trim()) {
      setError("Please paste some notes to summarise.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          max_sentences: Number(maxSentences),
        }),
      });

      if (!res.ok) {
        throw new Error("Server error. Please try again.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleCopySummary = async () => {
    if (!result || !result.summary) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result.summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = result.summary;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={`app ${theme === "light" ? "theme-light" : "theme-dark"}`}>
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <span className="logo-dot" />
            <div>
              <h1>AI Notes Summariser</h1>
              <p>Summarise your notes with ML, instantly.</p>
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <>
                <span role="img" aria-hidden="true">
                  🌞
                </span>
                Light
              </>
            ) : (
              <>
                <span role="img" aria-hidden="true">
                  🌙
                </span>
                Dark
              </>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <form className="input-card" onSubmit={handleSubmit}>
          <label htmlFor="notes">Your Notes</label>
          <textarea
            id="notes"
            placeholder="Paste lecture notes, article, or any long text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
          />

          <div className="controls">
            <div className="control-group">
              <label>Summary length (sentences)</label>
              <input
                type="number"
                min="1"
                max="7"
                value={maxSentences}
                onChange={(e) => setMaxSentences(e.target.value)}
              />
            </div>

            <div className="buttons">
              <button type="button" onClick={handleClear} className="secondary">
                Clear
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Summarising..." : "Summarise"}
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
        </form>

        {result && (
          <section className="results">
            <div className="result-card">
              <div className="result-header">
                <h2>Summary</h2>
                <button
                  type="button"
                  className="mini-button"
                  onClick={handleCopySummary}
                  disabled={!result.summary}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {result.summary ? (
                <p>{result.summary}</p>
              ) : (
                <p>No summary generated.</p>
              )}
            </div>

            <div className="result-card">
              <h2>Keywords</h2>
              {result.keywords && result.keywords.length > 0 ? (
                <div className="tags">
                  {result.keywords.map((kw, index) => (
                    <span className="tag" key={index}>
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No keywords extracted.</p>
              )}
            </div>

            <div className="result-card">
              <h2>Sentiment</h2>
              <p>
                <strong>Label:</strong> {result.sentiment_label}
              </p>
              <p>
                <strong>Score:</strong> {result.sentiment_score}
              </p>
              <small>
                Score is a simple positive–negative word ratio (demo sentiment).
              </small>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Made by Akshaya · AIML + React project</p>
      </footer>
    </div>
  );
}

export default App;
