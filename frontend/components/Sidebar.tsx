"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/", icon: "🏠" },
    { label: "Upload Contract", href: "/upload", icon: "📤" },
    { label: "Analyzed Contracts", href: "/", icon: "📁" },
    { label: "Risk Reports", href: "/", icon: "⚠️" },
    { label: "Clause Library", href: "/", icon: "📜" },
    { label: "Templates", href: "/", icon: "📄" },
    { label: "API Settings", href: "/", icon: "🔌" },
    { label: "Billing & Usage", href: "/", icon: "💳" },
    { label: "Settings", href: "/", icon: "⚙️" },
    { label: "Help & Support", href: "/", icon: "❓" },
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
          // In the sidebar, highlight item as active based on pathname
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
            <span className="text-xs font-bold text-slate-300">API Status</span>
          </div>
          <div className="text-xs font-semibold text-emerald-400 mb-1">Online</div>
          <div className="text-[10px] text-slate-500">All systems operational</div>
        </div>
      </div>
    </aside>
  );
}
