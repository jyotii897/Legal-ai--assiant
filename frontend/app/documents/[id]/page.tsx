"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

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
  
  const { language, t } = useLanguage();

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Vapi States
  const [vapi, setVapi] = useState<any>(null);
  const [vapiCallActive, setVapiCallActive] = useState(false);
  const [showVapiModal, setShowVapiModal] = useState(false);
  const [vapiPublicKey, setVapiPublicKey] = useState("");
  const [vapiAssistantId, setVapiAssistantId] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8000/api/document/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Document not found"); return r.json(); })
      .then(setDoc)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));

    // Load Vapi settings from LocalStorage
    setVapiPublicKey(localStorage.getItem("vapiPublicKey") || "");
    setVapiAssistantId(localStorage.getItem("vapiAssistantId") || "");

    // Inject Vapi script tag dynamically
    if (!(window as any).vapiSDK) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/vapi-ai/html-script-tag@latest/dist/assets/index.js";
      script.defer = true;
      script.async = true;
      document.body.appendChild(script);
    }
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
        body: JSON.stringify({ document_id: id, question: q, language }),
      });
      const data = await res.json();
      setChat((c) => [...c, { role: "ai", content: data.answer || "No answer returned." }]);
    } catch {
      setChat((c) => [...c, { role: "ai", content: language === "en" ? "Connection error. Is the backend running?" : "कनेक्शन त्रुटि। क्या बैकएंड चालू है?" }]);
    } finally { setAsking(false); }
  };

  // Browser Speech-to-Text (STT)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "en" ? "en-US" : "hi-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setQuestion(text);
      setIsListening(false);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Browser Text-to-Speech (TTS)
  const toggleSpeech = (text: string, index: number) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : "hi-IN";

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(language === "en" ? "en" : "hi"));
    if (voice) utterance.voice = voice;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Vapi Call Handlers
  const handleVapiCall = () => {
    if (vapiCallActive) {
      if (vapi) vapi.stop();
      setVapiCallActive(false);
      return;
    }
    if (!vapiPublicKey || !vapiAssistantId) {
      setShowVapiModal(true);
      return;
    }
    startVapiSession(vapiPublicKey, vapiAssistantId);
  };

  const startVapiSession = (pubKey: string, assistantId: string) => {
    try {
      if (!(window as any).vapiSDK) {
        alert("Vapi SDK is still loading. Please wait a moment.");
        return;
      }
      localStorage.setItem("vapiPublicKey", pubKey);
      localStorage.setItem("vapiAssistantId", assistantId);
      setShowVapiModal(false);

      const vInstance = (window as any).vapiSDK.run({
        apiKey: pubKey,
        assistant: assistantId,
        config: {
          position: "bottom-right",
        }
      });

      setVapi(vInstance);
      setVapiCallActive(true);

      vInstance.on("call-end", () => setVapiCallActive(false));
      vInstance.on("error", (err: any) => {
        console.error("Vapi Error:", err);
        alert("Vapi Call Error: Please check your Public Key and Assistant ID.");
        setVapiCallActive(false);
      });
    } catch (e: any) {
      alert("Failed to start Vapi voice agent: " + e.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">{t("loadingReport")}</p>
    </div>
  );

  if (err || !doc) return (
    <div className="max-w-lg mx-auto mt-24 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <p className="text-red-400 text-lg mb-8">{err || t("docNotFound")}</p>
      <Link href="/" className="btn-primary px-8 py-3 text-base inline-block">{t("backToDashboard")}</Link>
    </div>
  );

  const tabs = [
    { key: "summary", label: `📋 ${language === "en" ? "Summary" : "सारांश"}` },
    { key: "risks", label: `⚠️ ${language === "en" ? "Risks" : "जोखिम"} (${doc.risks.length})` },
    { key: "clauses", label: `📌 ${language === "en" ? "Clauses" : "धाराएं"} (${doc.clauses.length})` },
    { key: "chat", label: `💬 ${language === "en" ? "Chat" : "चैट"}` },
  ] as const;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="card mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border-none shadow-none bg-gradient-to-r from-slate-900/60 to-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[60px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-slate-400 hover:text-teal-400 text-sm font-medium transition-colors">
              {language === "en" ? "← Dashboard" : "← डैशबोर्ड"}
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{doc.filename}</h1>
          <p className="text-slate-500 text-xs font-mono">ID: {doc.id}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <div className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-0.5">{doc.chunks_count}</div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t("chunks")}</div>
          </div>
          <div className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-0.5">{doc.clauses_count}</div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t("clauses")}</div>
          </div>
          <div className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-0.5">{doc.risks_count}</div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t("risks")}</div>
          </div>
          <span className={`${riskBadge[doc.overall_risk] || "badge badge-low"} px-5 py-3 text-sm rounded-xl ml-2`}>
            {doc.overall_risk} {language === "en" ? "Risk" : "जोखिम"}
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
            <span className="text-teal-400">✧</span> {t("aiSummary")}
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
            <span className="text-teal-400">✧</span> {t("riskAnalysis")}
          </p>
          {doc.risks.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-emerald-400 font-semibold text-lg">{t("noRisks")}</p>
              <p className="text-slate-500 mt-2 text-sm">{t("noRisksDesc")}</p>
            </div>
          ) : doc.risks.map((r, i) => (
            <div key={i} className="card border-l-4 transition-transform hover:-translate-y-0.5"
              style={{ borderLeftColor: { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" }[r.risk_level] || "#22c55e" }}>
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-white text-base">🔍 {r.pattern_found}</span>
                <span className={`${riskBadge[r.risk_level]}`}>{r.risk_level} {language === "en" ? "Risk" : "जोखिम"}</span>
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
            <span className="text-teal-400">✧</span> {t("extractedClauses")}
          </p>
          {doc.clauses.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-slate-400">{t("noClauses")}</p>
            </div>
          ) : doc.clauses.map((c, i) => (
            <div key={i} className="card hover:border-teal-500/30 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="clause-tag">{c.clause_type}</span>
                <span className="text-teal-400/80 text-xs font-mono bg-teal-500/10 px-3 py-1 rounded-full">
                  {t("confidence")}: {Math.round(c.confidence * 100)}%
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
        <div className="card flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500 !p-0 overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="p-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <p className="section-header !mb-0 !border-0 !pb-0">
              <span className="text-teal-400">✧</span> {t("chatbotTitle")}
            </p>
            <div className="flex items-center gap-2">
              {/* Vapi Active Indicator */}
              {vapiCallActive && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
              {/* Vapi Call Button */}
              <button
                onClick={handleVapiCall}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                  vapiCallActive
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
                    : "bg-white/[0.04] border border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span>📞</span>
                <span>{vapiCallActive ? (language === "en" ? "Stop Voice Agent" : "वॉयस एजेंट रोकें") : (language === "en" ? "Voice Agent (Vapi)" : "वॉयस एजेंट (Vapi)")}</span>
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/20">
            {chat.length === 0 && (
              <div className="text-center text-slate-500 mt-20">
                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="font-medium text-slate-300 mb-2">{t("chatPrompt")}</p>
                <div className="flex flex-col gap-2 mt-4 max-w-sm mx-auto">
                  <button onClick={() => setQuestion(language === "en" ? "What are the payment terms?" : "भुगतान की शर्तें क्या हैं?")} className="text-xs text-teal-300 bg-teal-500/10 py-2 px-4 rounded-lg hover:bg-teal-500/20 transition-colors">
                    {language === "en" ? `"What are the payment terms?"` : `"भुगतान की शर्तें क्या हैं?"`}
                  </button>
                  <button onClick={() => setQuestion(language === "en" ? "What is the notice period for termination?" : "अनुबंध समाप्त करने के लिए नोटिस की अवधि क्या है?")} className="text-xs text-emerald-300 bg-emerald-500/10 py-2 px-4 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    {language === "en" ? `"What is the notice period for termination?"` : `"अनुबंध समाप्त करने के लिए नोटिस की अवधि क्या है?"`}
                  </button>
                </div>
              </div>
            )}
            
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                <div className="flex flex-col items-start gap-1 max-w-[85%]">
                  <div className={m.role === "user" ? "chat-user" : "chat-ai"}>{m.content}</div>
                  
                  {/* Read Aloud Button on AI messages */}
                  {m.role === "ai" && (
                    <button
                      onClick={() => toggleSpeech(m.content, i)}
                      className={`text-[10px] flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-md border border-white/5 transition-all text-slate-400 hover:text-white hover:bg-white/5 ${
                        speakingIndex === i ? "bg-teal-500/10 !text-teal-400 border-teal-500/20 animate-pulse" : "bg-slate-900/40"
                      }`}
                    >
                      <span>{speakingIndex === i ? "🛑" : "🔊"}</span>
                      <span>{speakingIndex === i ? t("stopSpeaking") : t("speakText")}</span>
                    </button>
                  )}
                </div>
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
          
          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-md">
            <div className="flex gap-3 max-w-4xl mx-auto items-center">
              
              {/* Mic Speech-to-Text Button */}
              <button
                onClick={startSpeechRecognition}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all border ${
                  isListening
                    ? "bg-red-500 border-red-500/30 text-white animate-pulse"
                    : "bg-white/[0.04] border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
                title={t("startListening")}
              >
                <span className="text-xl">{isListening ? "🎙️" : "🎤"}</span>
              </button>

              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                placeholder={isListening ? t("listening") : t("inputPlaceholder")}
                className="glass-input flex-1 rounded-xl px-5 py-3.5 text-sm"
                disabled={isListening}
              />
              
              <button onClick={sendQuestion} disabled={!question.trim() || asking || isListening}
                className="btn-primary px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center min-w-[100px]">
                {asking ? "..." : t("sendBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Vapi Voice Call Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center">
        {vapiCallActive && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-50">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
        )}
        <button
          onClick={handleVapiCall}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            vapiCallActive
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
              : "bg-gradient-to-b from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white shadow-teal-500/30"
          }`}
          title={vapiCallActive ? "Stop Voice Assistant" : "Talk to Legal Voice Assistant (Vapi)"}
        >
          <span className="text-2xl">{vapiCallActive ? "🛑" : "🎙️"}</span>
        </button>
      </div>

      {/* Vapi Setup Modal */}
      {showVapiModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="card max-w-md w-full border border-white/10 p-6 bg-slate-900/90 shadow-2xl relative">
            <button
              onClick={() => setShowVapiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>🎙️</span> Configure Vapi Voice Agent
            </h3>
            <p className="text-slate-400 text-xs mb-5 leading-relaxed">
              Enter your Vapi.ai API Key (Public Token) and Assistant ID below to launch real-time voice calls. You can get these details from your Vapi Dashboard.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Vapi Public Key</label>
                <input
                  type="text"
                  value={vapiPublicKey}
                  onChange={(e) => setVapiPublicKey(e.target.value)}
                  placeholder="e.g. 12ab34cd-56ef-78gh..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Vapi Assistant ID</label>
                <input
                  type="text"
                  value={vapiAssistantId}
                  onChange={(e) => setVapiAssistantId(e.target.value)}
                  placeholder="e.g. ab12cd34-ef56-gh78..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowVapiModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => startVapiSession(vapiPublicKey, vapiAssistantId)}
                disabled={!vapiPublicKey.trim() || !vapiAssistantId.trim()}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold"
              >
                Start Voice Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
