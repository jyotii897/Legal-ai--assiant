"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <Link
          href="/"
          className={`hover:text-white transition-colors ${
            pathname === "/" ? "current font-semibold text-teal-400" : "text-slate-400"
          }`}
        >
          Dashboard
        </Link>
        <span className="text-slate-600">/</span>
        <Link
          href="/upload"
          className={`hover:text-white transition-colors ${
            pathname === "/upload" ? "current font-semibold text-teal-400" : "text-slate-400"
          }`}
        >
          Upload Contract
        </Link>
      </div>
      <div className="topbar-actions">
        <Link href="/upload" className="btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold">
          + New Analysis
        </Link>
      </div>
    </header>
  );
}
