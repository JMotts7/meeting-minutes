import { useState, useEffect } from 'react';

export default function MeetingMinutes() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [uploads, setUploads] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const used = parseInt(localStorage.getItem("meeting_uploads")) || 0;
    setUploads(used);
    if (used >= 3) setLimitReached(true);
  }, []);

  const handleUpload = async () => {
    if (!file || limitReached) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setSummary(data.summary);
      const updated = uploads + 1;
      setUploads(updated);
      localStorage.setItem("meeting_uploads", updated);
      if (updated >= 3) setLimitReached(true);
    } catch (err) {
      alert("Error summarizing the meeting");
    }
    setLoading(false);
  };

  const redirectToStripe = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🎤 Meeting Minutes</h1>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Upload your meeting audio and get a clean, AI-powered summary.
      </p>

      {limitReached ? (
        <div>
          <p style={{ color: 'red', marginBottom: '1rem' }}>
            You've reached the free limit of 3 uploads.
          </p>
          <button onClick={redirectToStripe} style={{ padding: '0.5rem 1rem' }}>
            Upgrade for Unlimited
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: '1rem' }}
          />
          <br />
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            style={{ padding: '0.5rem 1rem' }}
          >
            {loading ? "Processing..." : `Upload and Summarize (${3 - uploads} free remaining)`}
          </button>
        </>
      )}

      {summary && (
        <div style={{ textAlign: 'left', marginTop: '2rem', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            📝 Meeting Summary
          </h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{summary}</pre>
        </div>
      )}
    </div>
  );
}
