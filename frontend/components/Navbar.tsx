"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <Link
          href="/"
          className={`hover:text-white transition-colors ${
            pathname === "/" ? "current font-semibold text-teal-400" : "text-slate-400"
          }`}
        >
          {t("dashboard")}
        </Link>
        <span className="text-slate-600">/</span>
        <Link
          href="/upload"
          className={`hover:text-white transition-colors ${
            pathname === "/upload" ? "current font-semibold text-teal-400" : "text-slate-400"
          }`}
        >
          {t("uploadContract")}
        </Link>
      </div>
      <div className="topbar-actions flex items-center gap-3">
        {/* Language Selection Toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95"
        >
          {language === "en" ? "🇺🇸 English" : "🇮🇳 हिंदी"}
        </button>

        <Link href="/upload" className="btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold">
          {t("newAnalysis")}
        </Link>
      </div>
    </header>
  );
}
