"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Clause { text: string; clause_type: string; confidence: number; }
interface Risk { risk_level: string; pattern_found: string; explanation: string; context: string; }
interface DocData {
  id: string; filename: string; summary: string; overall_risk: string;
  chunks_count: number; clauses_count: number; risks_count: number;
  clauses: Clause[]; risks: Risk[];
}
interface ChatMsg { role: "user" | "ai"; content: string; }

const riskBadge: Record<string, string> = {
  Critical: "badge badge-critical", High: "badge badge-high",
  Medium: "badge badge-medium", Low: "badge badge-low",
};

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"summary" | "risks" | "clauses" | "chat">("summary");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/document/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Document not found"); return r.json(); })
      .then(setDoc)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const sendQuestion = async () => {
    if (!question.trim() || asking) return;
    const q = question.trim();
    setQuestion("");
    setChat((c) => [...c, { role: "user", content: q }]);
    setAsking(true);
    try {
      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: id, question: q }),
      });
      const data = await res.json();
      setChat((c) => [...c, { role: "ai", content: data.answer || "No answer returned." }]);
    } catch {
      setChat((c) => [...c, { role: "ai", content: "Connection error. Is the backend running?" }]);
    } finally { setAsking(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">Loading analysis report...</p>
    </div>
  );

  if (err || !doc) return (
    <div className="max-w-lg mx-auto mt-24 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <p className="text-red-400 text-lg mb-8">{err || "Document not found."}</p>
      <Link href="/" className="btn-primary px-8 py-3 text-base inline-block">← Back to Dashboard</Link>
    </div>
  );

  const tabs = [
    { key: "summary", label: "📋 Summary" },
    { key: "risks", label: `⚠️ Risks (${doc.risks.length})` },
    { key: "clauses", label: `📌 Clauses (${doc.clauses.length})` },
    { key: "chat", label: "💬 Chat" },
  ] as const;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="card mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border-none shadow-none bg-gradient-to-r from-slate-900/60 to-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[60px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-slate-400 hover:text-teal-400 text-sm font-medium transition-colors">← Dashboard</Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{doc.filename}</h1>
          <p className="text-slate-500 text-xs font-mono">ID: {doc.id}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <div className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-0.5">{doc.chunks_count}</div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Chunks</div>
          </div>
          <div className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-0.5">{doc.clauses_count}</div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Clauses</div>
          </div>
          <div className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-0.5">{doc.risks_count}</div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Risks</div>
          </div>
          <span className={`${riskBadge[doc.overall_risk] || "badge badge-low"} px-5 py-3 text-sm rounded-xl ml-2`}>
            {doc.overall_risk} Risk
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 w-fit backdrop-blur-sm">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
              ${tab === t.key
                ? "bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20"
                : "text-slate-400 hover:text-teal-200 hover:bg-white/5"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {tab === "summary" && (
        <div className="card animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="section-header">
            <span className="text-teal-400">✧</span> AI-Generated Contract Summary
          </p>
          <div className="prose prose-invert max-w-none">
            {doc.summary.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**"))
                return <h3 key={i} className="text-teal-300 font-semibold mt-6 mb-3 text-sm uppercase tracking-wider">{line.replace(/\*\*/g, "")}</h3>;
              if (line.trim() === "") return <div key={i} className="h-3" />;
              return <p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">{line}</p>;
            })}
          </div>
        </div>
      )}

      {/* Risks Tab */}
      {tab === "risks" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="section-header mb-6">
            <span className="text-teal-400">✧</span> Risk Analysis
          </p>
          {doc.risks.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-emerald-400 font-semibold text-lg">No significant risks detected.</p>
              <p className="text-slate-500 mt-2 text-sm">The contract appears standard based on our rules engine.</p>
            </div>
          ) : doc.risks.map((r, i) => (
            <div key={i} className="card border-l-4 transition-transform hover:-translate-y-0.5"
              style={{ borderLeftColor: { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" }[r.risk_level] || "#22c55e" }}>
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-white text-base">🔍 {r.pattern_found}</span>
                <span className={`${riskBadge[r.risk_level]}`}>{r.risk_level} Risk</span>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{r.explanation}</p>
              <div className="bg-slate-900/80 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/30" />
                <p className="text-slate-400 text-sm font-serif italic pl-2">{r.context}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clauses Tab */}
      {tab === "clauses" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="section-header mb-6">
            <span className="text-teal-400">✧</span> Extracted Legal Clauses
          </p>
          {doc.clauses.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-slate-400">No clauses detected. Try a more structured legal document.</p>
            </div>
          ) : doc.clauses.map((c, i) => (
            <div key={i} className="card hover:border-teal-500/30 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="clause-tag">{c.clause_type}</span>
                <span className="text-teal-400/80 text-xs font-mono bg-teal-500/10 px-3 py-1 rounded-full">
                  Confidence: {Math.round(c.confidence * 100)}%
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-white/5">
                {c.text.length > 500 ? c.text.slice(0, 500) + "…" : c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chat Tab */}
      {tab === "chat" && (
        <div className="card flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500 !p-0 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/[0.01]">
            <p className="section-header !mb-0 !border-0 !pb-0">
              <span className="text-teal-400">✧</span> Legal AI Chatbot
            </p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/20">
            {chat.length === 0 && (
              <div className="text-center text-slate-500 mt-20">
                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="font-medium text-slate-300 mb-2">Ask anything about this contract.</p>
                <div className="flex flex-col gap-2 mt-4 max-w-sm mx-auto">
                  <button onClick={() => setQuestion("What are the payment terms?")} className="text-xs text-teal-300 bg-teal-500/10 py-2 px-4 rounded-lg hover:bg-teal-500/20 transition-colors">"What are the payment terms?"</button>
                  <button onClick={() => setQuestion("What is the notice period for termination?")} className="text-xs text-emerald-300 bg-emerald-500/10 py-2 px-4 rounded-lg hover:bg-emerald-500/20 transition-colors">"What is the notice period for termination?"</button>
                </div>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={m.role === "user" ? "chat-user" : "chat-ai"}>{m.content}</div>
              </div>
            ))}
            {asking && (
              <div className="flex justify-start">
                <div className="chat-ai flex gap-2 items-center h-12">
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-md">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                placeholder="Ask a legal question about this contract…"
                className="glass-input flex-1 rounded-xl px-5 py-3.5 text-sm"
              />
              <button onClick={sendQuestion} disabled={!question.trim() || asking}
                className="btn-primary px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center min-w-[100px]">
                {asking ? "..." : "Send ➤"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
