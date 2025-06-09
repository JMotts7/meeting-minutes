import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(3); // Starting with 3 free uses

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file first.");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      setSummary(data.summary);
      setRemaining((prev) => prev - 1);
    } catch (err) {
      alert("Error summarizing the meeting");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>🎤 Meeting Minutes</h1>
      <p>Upload your meeting audio and get a clean, AI-powered summary.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading
            ? "Processing..."
            : `Upload and Summarize (${remaining} free remaining)`}
        </button>
      </form>

      {summary && (
        <div style={{ marginTop: "2rem", maxWidth: "600px", margin: "auto" }}>
          <h2>📝 Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}
