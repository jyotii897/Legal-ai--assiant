"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  const stages = [
    "📄 Extracting text (OCR)...",
    "✂️ Chunking document...",
    "🧠 Generating embeddings...",
    "🔍 Building FAISS index...",
    "📌 Classifying clauses (LegalBERT)...",
    "⚠️ Running risk analysis...",
    "📝 Generating AI summary...",
  ];

  const handleFile = (f: File) => {
    setError("");
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      setError("Only PDF, DOCX, and TXT files are supported.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    let i = 0;
    setStage(stages[0]);
    const interval = setInterval(() => {
      i = Math.min(i + 1, stages.length - 1);
      setStage(stages[i]);
    }, 2500);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: form,
      });
      clearInterval(interval);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      router.push(`/documents/${data.document_id}`);
    } catch (e: unknown) {
      clearInterval(interval);
      setUploading(false);
      setStage("");
      setError(e instanceof Error ? e.message : "Upload failed. Is the backend running?");
    }
  };

  return (
    <div className="upload-container">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 className="page-title">Upload Legal Contract</h1>
        <p className="page-subtitle">Supports PDF · DOCX · TXT — AI analysis runs automatically</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("file-input")?.click()}
        className={`upload-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#34d399", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{file.name}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{(file.size / 1024).toFixed(1)} KB — Click to change file</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Drag & drop your contract here</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>or click to browse from your computer</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#fca5a5",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span>❌</span> {error}
        </div>
      )}

      {uploading && (
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="spinner" />
              <span style={{ color: "#a78bfa", fontSize: 12.5, fontWeight: 600 }}>{stage}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}>Processing</span>
          </div>
          <div style={{ width: "100%", background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
            <div style={{
              background: "linear-gradient(90deg, #7c3aed, #2563eb)",
              height: "100%",
              width: "75%",
              borderRadius: 99
            }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 10 }}>
            Running 7-layer AI pipeline — this usually takes 15-30 seconds...
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary"
        style={{ width: "100%", marginTop: 16, justifyContent: "center", padding: 12, fontSize: 13, borderRadius: 10 }}
      >
        {uploading ? "Analyzing Document…" : "🚀 Analyze Contract"}
      </button>

      {/* Feature list */}
      <div className="mt-16" style={{ marginTop: 32 }}>
        <h3 style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
          marginBottom: 16
        }}>Analysis Pipeline</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["🔍", "OCR Extraction", "PyMuPDF · DOCX"],
            ["✂️", "Smart Chunking", "Semantic windowing"],
            ["🧠", "Vector Search", "MiniLM-L6 Embeddings"],
            ["📌", "Clause Detection", "LegalBERT Hybrid"],
            ["⚠️", "Risk Engine", "Rule-based scoring"],
            ["💬", "RAG Engine", "Generative AI"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="card" style={{ padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{title}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
