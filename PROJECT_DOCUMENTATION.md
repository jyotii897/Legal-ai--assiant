# AI Legal Assistant - Project Documentation

This document provides a comprehensive overview of the AI Legal Assistant project, explaining its architecture, technologies, module breakdown, and how data flows through the system.

## 🏗️ Architecture Overview

The system is a full-stack web application designed to ingest legal documents (PDF, DOCX, TXT), analyze them for risks and clauses, summarize them, and allow users to ask questions against the text using a Retrieval-Augmented Generation (RAG) pipeline.

The project is split into two main directories:
1. **Frontend**: A Next.js (React) application for the user interface.
2. **Backend**: A FastAPI (Python) server for all data processing and AI tasks.

---

## 🎨 Frontend (Next.js)

The frontend provides a dashboard to upload contracts and view AI-generated insights.

### Technologies Used
- **Next.js (App Router)**: React framework for building the application structure and routing.
- **Tailwind CSS**: Utility-first CSS framework for styling (`frontend/app/globals.css`).
- **TypeScript**: Typed superset of JavaScript for reliable code.
- **Lucide React**: Icon library used across the UI.

### Key Components
- **`frontend/app/page.tsx`**: The main dashboard page showing a list of analyzed documents. It fetches data from the backend (`GET /api/documents`).
- **`frontend/app/upload/page.tsx`** (implied): The upload interface where users submit contracts via a form.
- **`frontend/app/documents/[id]/page.tsx`** (implied): The detailed document view displaying the summary, risks, clauses, and a chat interface to ask questions about the contract.
- **`frontend/components/Navbar.tsx`**: Top navigation bar with links to "Dashboard" and "Upload Contract".

---

## ⚙️ Backend (FastAPI)

The backend handles the heavy lifting, orchestrating NLP models and LLM APIs to process legal texts.

### Technologies Used
- **FastAPI**: High-performance Python web framework for serving APIs.
- **Google Gemini API**: Cloud provider used to run the `gemini-2.0-flash` LLM (Large Language Model) via `google-genai` for text summarization and RAG-based Q&A.
- **Sentence-Transformers**: HuggingFace library used to generate text embeddings (`all-MiniLM-L6-v2`).
- **FAISS (Facebook AI Similarity Search)**: In-memory vector database used for fast similarity searches during RAG.
- **PyMuPDF (`fitz`) / `python-docx`**: Libraries used for extracting raw text from PDFs and DOCX files.

### 🗂️ Module Breakdown & File Structure

#### 1. API Core
- **`backend/main.py`**: The entry point of the server. It handles CORS, routing, and orchestrates the entire pipeline upon document upload. It contains endpoints:
  - `POST /api/upload`: Receives the file, extracts text, chunks it, detects clauses/risks, summarizes, and stores the result in memory.
  - `GET /api/documents`: Returns a list of all processed documents.
  - `GET /api/document/{doc_id}`: Returns full analysis details for a specific document.
  - `POST /api/query`: Handles chat Q&A using RAG.
- **`backend/requirements.txt`**: Python dependencies.
- **`backend/.env`**: Stores the API keys (e.g., `GEMINI_API_KEY`).

#### 2. Text Extraction (`backend/utils/`)
- **`ocr.py`**: Contains `extract_text_from_pdf` (using `fitz`) and `extract_text_from_docx` (using `docx`). Converts uploaded files into raw strings.
- **`summarizer.py`**: Uses the Gemini API (`gemini-2.0-flash`) to generate a structured summary of the contract based on a predefined `SUMMARY_PROMPT`.

#### 3. Legal Intelligence (`backend/legal/`)
- **`legalbert.py`**: A hybrid keyword-based classification system that scores chunks of text to determine what kind of clause it is (e.g., Termination, Liability, Payment).
- **`clause_detector.py`**: Iterates over all chunks of a document and uses `legalbert.py` to identify the most prominent legal clauses, storing the highest confidence matches.
- **`risk_engine.py`**: A rule-based risk detection system. It scans text chunks for specific, risky phrasing (e.g., "unlimited liability", "auto-renew") and maps them to Risk Levels (Critical, High, Medium, Low). It also calculates an `overall_risk` for the entire document.

#### 4. Retrieval-Augmented Generation (RAG) (`backend/rag/`)
This module enables the chat feature, allowing users to ask questions about the document.
- **`chunker.py`**: Splits the long document string into overlapping chunks (600 characters, 100 overlap). It uses sentence-boundary awareness (looking for periods) so it doesn't cut sentences in half.
- **`embeddings.py`**: Uses `sentence-transformers/all-MiniLM-L6-v2` to convert text chunks into numerical vectors (embeddings) so they can be mathematically compared.
- **`retriever.py`**: Takes the chunk embeddings and stores them in a FAISS memory index. When a user asks a question, it embeds the question, searches the FAISS index for the top 5 most similar chunks, and returns them as context.
- **`qa.py`**: Takes the context chunks found by FAISS, packages them with the user's question, and sends them to the Gemini API (`gemini-2.0-flash`) to generate an accurate, context-aware answer.
- **`loader.py`**: A simple wrapper around `ocr.py`.

---

## 🔄 Data Flow: What happens when a user uploads a document?

1. User uploads a PDF via the Next.js **frontend**.
2. **FastAPI** (`main.py`) receives the file and saves it to `./uploads/`.
3. **`ocr.py`** extracts the raw text from the file.
4. **`chunker.py`** splits the text into overlapping 600-character chunks.
5. **`clause_detector.py`** runs through the chunks to classify legal clauses (Termination, Payment, etc.).
6. **`risk_engine.py`** scans the chunks for dangerous keywords and flags Critical/High/Medium risks.
7. **`embeddings.py`** turns the chunks into vectors, and **`retriever.py`** loads them into a FAISS memory index.
8. **`summarizer.py`** calls Gemini to generate a structured AI summary.
9. All this data is bundled into a JSON object and saved to an in-memory dictionary in `main.py`.
10. The **frontend** receives the JSON response and displays the insights dashboard.
11. When the user asks a question in the chat, **`retriever.py`** pulls relevant chunks from FAISS, and **`qa.py`** asks Gemini to answer based on those chunks.
