"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface DocMeta {
  id: string;
  filename: string;
  overall_risk: string;
  chunks_count: number;
  clauses_count: number;
  risks_count: number;
}

const riskBadge: Record<string, string> = {
  Critical: "badge badge-critical",
  High: "badge badge-high",
  Medium: "badge badge-medium",
  Low: "badge badge-low",
};

export default function Dashboard() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    fetch("http://localhost:8000/api/documents")
      .then((r) => r.json())
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const critical = docs.filter((d) => d.overall_risk === "Critical").length;
  const high = docs.filter((d) => d.overall_risk === "High").length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900/60 to-slate-900/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-teal-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {language === "en" ? "Contract Intelligence" : "अनुबंध इंटेलिजेंस"}{" "}
            <span className="text-teal-400">{language === "en" ? "Dashboard" : "डैशबोर्ड"}</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {language === "en"
              ? "Upload legal contracts for AI-powered analysis — OCR · RAG · LegalBERT · Risk Detection"
              : "एआई-संचालित विश्लेषण के लिए कानूनी अनुबंध अपलोड करें — ओसीआर · रैग · लीगलबीईआरटी · जोखिम पहचान"}
          </p>
        </div>

        {/* Connecting Lines Illustration */}
        <div className="relative z-10 hidden lg:flex items-center justify-center h-28 w-96 flex-shrink-0 select-none">
          {/* Document Graphic */}
          <div className="relative bg-slate-950/80 border border-white/10 rounded-xl p-4 w-28 h-24 flex flex-col justify-between shadow-2xl">
            {/* Scale Icon inside Document */}
            <div className="text-teal-400 text-3xl mx-auto mt-1">⚖️</div>
            {/* Magnifying Glass Overlay */}
            <div className="absolute -bottom-1 -right-1 text-2xl drop-shadow-md">🔍</div>
            {/* Document Lines */}
            <div className="space-y-1 w-full mt-2">
              <div className="h-1 bg-white/10 rounded w-5/6 mx-auto" />
              <div className="h-1 bg-white/10 rounded w-2/3 mx-auto" />
            </div>
          </div>

          {/* Connected Badges */}
          <div className="absolute right-0 h-full flex flex-col justify-between py-1 text-[10px] font-bold">
            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
              <span className="text-teal-400">🔍</span>
              <span className="text-slate-300">OCR</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-full shadow-lg ml-6">
              <span className="text-emerald-400">🧠</span>
              <span className="text-slate-300">RAG</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-full shadow-lg ml-6">
              <span className="text-violet-400">📌</span>
              <span className="text-slate-300">LegalBERT</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
              <span className="text-amber-400">🛡️</span>
              <span className="text-slate-300">Risk Detection</span>
            </div>
          </div>

          {/* Dotted Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            <path d="M 125,24 C 160,24 180,16 230,16" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            <path d="M 125,44 C 160,44 180,44 245,44" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            <path d="M 125,64 C 160,64 180,72 245,72" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            <path d="M 125,84 C 160,84 180,98 230,98" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            <circle cx="125" cy="56" r="3" fill="#2dd4bf" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: t("totalDocuments"), value: docs.length, subtext: t("contractsUploaded"), icon: "📁", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/10" },
          { label: t("criticalRisks"),  value: critical,    subtext: t("requiresAttention"), icon: "⚠️",  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/10" },
          { label: t("highRisks"),      value: high,        subtext: t("highPriorityIssues"), icon: "🔥",  color: "text-orange-400", bg: "bg-orange-500/10",  border: "border-orange-500/10" },
          { label: t("apiStatus"),      value: language === "en" ? "Online" : "ऑनलाइन",    subtext: t("systemsOperational"), icon: "⚡",  color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className={`card flex flex-col p-6 hover:-translate-y-1 transition-all border ${s.border} bg-[#0b0c16]/50`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                {s.icon}
              </div>
              <div className={`text-4xl font-extrabold tracking-tight ${s.color}`}>
                {loading && typeof s.value === "number" ? "…" : s.value}
              </div>
            </div>
            <div className="text-white text-sm font-semibold mb-1">{s.label}</div>
            <div className="text-slate-400 text-xs">{s.subtext}</div>
          </div>
        ))}
      </div>

      {/* Documents Table */}
      <div className="card !p-0 overflow-hidden bg-[#0b0c16]/50 border border-white/5">
        <div className="px-6 sm:px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="font-semibold text-white text-lg">{t("analyzedContracts")}</h2>
          <Link href="/upload" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <span>📤</span> {t("uploadContract")}
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-slate-400">{t("loadingDocs")}</div>
          </div>
        ) : docs.length === 0 ? (
          <div className="py-16 sm:py-24 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-900/40 border border-dashed border-slate-500/30 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
              <span className="text-4xl">📂</span>
              <div className="absolute inset-[-8px] border border-dashed border-slate-600/30 rounded-full animate-[spin_40s_linear_infinite]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{t("noContractsYet")}</h3>
            <p className="text-slate-400 mb-6 text-sm sm:text-base max-w-md mx-auto">{t("uploadPrompt")}</p>
            <Link href="/upload" className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base flex items-center gap-2">
              <span>📤</span> {t("uploadFirstBtn")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-8 py-4 text-left font-semibold">{t("document")}</th>
                  <th className="px-8 py-4 text-left font-semibold">{t("chunks")}</th>
                  <th className="px-8 py-4 text-left font-semibold">{t("clauses")}</th>
                  <th className="px-8 py-4 text-left font-semibold">{t("risks")}</th>
                  <th className="px-8 py-4 text-left font-semibold">{t("riskLevel")}</th>
                  <th className="px-8 py-4 text-left font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{doc.filename}</div>
                      <div className="text-slate-500 text-xs mt-1 font-mono">ID: {doc.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-8 py-5 text-slate-400">{doc.chunks_count}</td>
                    <td className="px-8 py-5 text-slate-400">{doc.clauses_count}</td>
                    <td className="px-8 py-5 text-slate-400">{doc.risks_count}</td>
                    <td className="px-8 py-5">
                      <span className={riskBadge[doc.overall_risk] || "badge badge-low"}>
                        {doc.overall_risk}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link href={`/documents/${doc.id}`}
                        className="inline-flex items-center text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors">
                        {t("viewReport")} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
