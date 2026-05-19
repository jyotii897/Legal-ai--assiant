import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Legal AI Assistant | Contract Intelligence",
  description: "AI-powered legal document analysis — OCR, RAG, LegalBERT, Risk Detection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#020617" }}>
      <body
        className={`${inter.variable} font-sans min-h-screen selection:bg-teal-500/30 selection:text-teal-200`}
        style={{ backgroundColor: "#020617", color: "#e2e8f0" }}
      >
        <div className="app-shell">
          <Sidebar />
          <div className="main-area">
            <Navbar />
            <main className="page-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
