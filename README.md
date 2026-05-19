# Legal Document AI Assistant

AI-powered legal contract analysis using RAG, FAISS, LegalBERT, and Gemini.

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Add your Gemini API key
copy .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
# Get free key at: https://aistudio.google.com

# 4. Run the app
streamlit run app.py
```

## Features
- **OCR** — PDF, DOCX, TXT text extraction via PyMuPDF
- **Chunking** — 600-char chunks with 100-char overlap
- **FAISS** — Semantic vector search
- **LegalBERT** — Clause classification (nlpaueb/legal-bert-base-uncased)
- **Risk Detection** — Critical / High / Medium / Low
- **Gemini RAG** — Grounded Q&A from contract context
- **Summary** — AI-generated legal contract summary
