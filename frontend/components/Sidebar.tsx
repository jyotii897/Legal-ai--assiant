"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const menuItems = [
    { label: t("dashboard"), href: "/", icon: "🏠" },
    { label: t("uploadContract"), href: "/upload", icon: "📤" },
    { label: t("analyzedContracts"), href: "/", icon: "📁" },
    { label: t("risks"), href: "/", icon: "⚠️" },
    { label: language === "en" ? "Clause Library" : "क्लॉज लाइब्रेरी", href: "/", icon: "📜" },
    { label: language === "en" ? "Templates" : "टेम्पलेट्स", href: "/", icon: "📄" },
    { label: language === "en" ? "API Settings" : "एपीआई सेटिंग्स", href: "/", icon: "🔌" },
    { label: language === "en" ? "Billing & Usage" : "बिलिंग और उपयोग", href: "/", icon: "💳" },
    { label: language === "en" ? "Settings" : "सेटिंग्स", href: "/", icon: "⚙️" },
    { label: language === "en" ? "Help & Support" : "सहायता और सहायता", href: "/", icon: "❓" },
  ];

  return (
    <aside className="sidebar flex-shrink-0">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚖️</div>
        <div className="sidebar-logo-text">
          <span>Legal</span>
          <span className="text-teal-400">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / API Status Card */}
      <div className="sidebar-footer">
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">{t("apiStatus")}</span>
          </div>
          <div className="text-xs font-semibold text-emerald-400 mb-1">
            {language === "en" ? "Online" : "ऑनलाइन"}
          </div>
          <div className="text-[10px] text-slate-500">{t("systemsOperational")}</div>
        </div>
      </div>
    </aside>
  );
}
