"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    uploadContract: "Upload Contract",
    analyzedContracts: "Analyzed Contracts",
    totalDocuments: "Total Documents",
    contractsUploaded: "Contracts uploaded",
    criticalRisks: "Critical Risks",
    requiresAttention: "Requires immediate attention",
    highRisks: "High Risks",
    highPriorityIssues: "High priority issues",
    apiStatus: "API Status",
    systemsOperational: "All systems operational",
    noContractsYet: "No contracts analyzed yet",
    uploadPrompt: "Upload your first contract to extract clauses, identify risks, and chat with the document.",
    uploadFirstBtn: "Upload Your First Contract",
    newAnalysis: "+ New Analysis",
    loadingDocs: "Loading documents...",
    document: "Document",
    chunks: "Chunks",
    clauses: "Clauses",
    risks: "Risks",
    riskLevel: "Risk Level",
    viewReport: "View Report",
    
    // Upload page
    uploadTitle: "Upload Legal Contract",
    uploadSub: "Supports PDF · DOCX · TXT — AI analysis runs automatically",
    dragDrop: "Drag & drop your contract here",
    browse: "or click to browse from your computer",
    analyzeBtn: "Analyze Contract",
    analyzingBtn: "Analyzing Contract...",
    pipelineTitle: "ANALYSIS PIPELINE",
    ocrTitle: "OCR Extraction",
    ocrDesc: "PyMuPDF · DOCX",
    chunkTitle: "Smart Chunking",
    chunkDesc: "Semantic windowing",
    vectorTitle: "Vector Search",
    vectorDesc: "MiniLM-L6 Embeddings",
    clauseTitle: "Clause Detection",
    clauseDesc: "LegalBERT Hybrid",
    riskEngineTitle: "Risk Engine",
    riskEngineDesc: "Rule-based scoring",
    ragTitle: "RAG Engine",
    ragDesc: "Generative AI",
    
    // Document page
    aiSummary: "AI-Generated Contract Summary",
    riskAnalysis: "Risk Analysis",
    extractedClauses: "Extracted Legal Clauses",
    chatbotTitle: "Legal AI Chatbot",
    chatPrompt: "Ask anything about this contract.",
    inputPlaceholder: "Ask a legal question about this contract…",
    sendBtn: "Send ➤",
    noRisks: "No significant risks detected.",
    noRisksDesc: "The contract appears standard based on our rules engine.",
    noClauses: "No clauses detected. Try a more structured legal document.",
    confidence: "Confidence",
    loadingReport: "Loading analysis report...",
    docNotFound: "Document not found.",
    backToDashboard: "← Back to Dashboard",
    speakText: "Speak Answer",
    stopSpeaking: "Stop Speaking",
    startListening: "Speak Question",
    listening: "Listening..."
  },
  hi: {
    dashboard: "डैशबोर्ड",
    uploadContract: "अनुबंध अपलोड करें",
    analyzedContracts: "विश्लेषित अनुबंध",
    totalDocuments: "कुल दस्तावेज़",
    contractsUploaded: "अपलोड किए गए अनुबंध",
    criticalRisks: "महत्वपूर्ण जोखिम",
    requiresAttention: "तत्काल ध्यान देने की आवश्यकता है",
    highRisks: "उच्च जोखिम",
    highPriorityIssues: "उच्च प्राथमिकता वाले मुद्दे",
    apiStatus: "एपीआई स्थिति",
    systemsOperational: "सभी सिस्टम चालू हैं",
    noContractsYet: "कोई भी अनुबंध अभी तक विश्लेषित नहीं हुआ है",
    uploadPrompt: "क्लॉज निकालने, जोखिमों की पहचान करने और दस्तावेज़ के साथ चैट करने के लिए अपना पहला अनुबंध अपलोड करें।",
    uploadFirstBtn: "अपना पहला अनुबंध अपलोड करें",
    newAnalysis: "+ नया विश्लेषण",
    loadingDocs: "दस्तावेज़ लोड हो रहे हैं...",
    document: "दस्तावेज़",
    chunks: "खंड (Chunks)",
    clauses: "धाराएं (Clauses)",
    risks: "जोखिम",
    riskLevel: "जोखिम स्तर",
    viewReport: "रिपोर्ट देखें",
    
    // Upload page
    uploadTitle: "कानूनी अनुबंध अपलोड करें",
    uploadSub: "पीडीएफ · डॉक्स · टीएक्सटी का समर्थन — एआई विश्लेषण स्वचालित रूप से चलता है",
    dragDrop: "अपने अनुबंध को यहां खींचें और छोड़ें",
    browse: "या अपने कंप्यूटर से ब्राउज़ करने के लिए क्लिक करें",
    analyzeBtn: "अनुबंध का विश्लेषण करें",
    analyzingBtn: "अनुबंध का विश्लेषण हो रहा है...",
    pipelineTitle: "विश्लेषण प्रक्रिया (Pipeline)",
    ocrTitle: "ओसीआर निष्कर्षण",
    ocrDesc: "PyMuPDF · डॉक्स",
    chunkTitle: "स्मार्ट चंकिंग",
    chunkDesc: "सिमेंटिक विंडोइंग",
    vectorTitle: "वेक्टर खोज",
    vectorDesc: "MiniLM-L6 एम्बेडिंग्स",
    clauseTitle: "धाराओं की पहचान",
    clauseDesc: "लीगलबीईआरटी हाइब्रिड",
    riskEngineTitle: "जोखिम इंजन",
    riskEngineDesc: "नियम-आधारित स्कोरिंग",
    ragTitle: "रैग (RAG) इंजन",
    ragDesc: "जेनरेटिव एआई",
    
    // Document page
    aiSummary: "एआई-जनरेटेड अनुबंध सारांश",
    riskAnalysis: "जोखिम विश्लेषण",
    extractedClauses: "निकाली गई कानूनी धाराएं",
    chatbotTitle: "कानूनी एआई चैटबॉट",
    chatPrompt: "इस अनुबंध के बारे में कुछ भी पूछें।",
    inputPlaceholder: "इस अनुबंध के बारे में कानूनी प्रश्न पूछें...",
    sendBtn: "भेजें ➤",
    noRisks: "कोई महत्वपूर्ण जोखिम नहीं मिला।",
    noRisksDesc: "हमारे नियम इंजन के आधार पर अनुबंध मानक प्रतीत होता है।",
    noClauses: "कोई धारा नहीं मिली। अधिक संरचित कानूनी दस्तावेज़ का प्रयास करें।",
    confidence: "सत्यता स्तर",
    loadingReport: "विश्लेषण रिपोर्ट लोड हो रही है...",
    docNotFound: "दस्तावेज़ नहीं मिला।",
    backToDashboard: "← डैशबोर्ड पर वापस जाएं",
    speakText: "उत्तर सुनें",
    stopSpeaking: "सुनना बंद करें",
    startListening: "बोलकर पूछें",
    listening: "सुन रहा हूँ..."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language;
    if (stored === "en" || stored === "hi") {
      setLanguage(stored);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
