from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, uuid, shutil
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Legal AI Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document store (demo — no DB needed per PRD)
document_store: dict = {}

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("./vectorstore", exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok", "message": "Legal AI Assistant API is running"}


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a legal document and run the full AI pipeline synchronously."""
    allowed_exts = [".pdf", ".docx", ".txt"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    doc_id = str(uuid.uuid4())[:8]
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}{ext}")

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        from rag.loader import load_document_from_path
        from rag.chunker import chunk_text
        from rag.retriever import build_faiss_index
        from legal.clause_detector import detect_all_clauses
        from legal.risk_engine import analyze_risks, get_overall_risk_level
        from utils.summarizer import generate_summary

        text = load_document_from_path(file_path)
        if not text or len(text.strip()) < 30:
            raise HTTPException(status_code=422, detail="Could not extract text from the document.")

        chunks = chunk_text(text)
        index, _ = build_faiss_index(chunks)
        clauses = detect_all_clauses(chunks)
        risks = analyze_risks(chunks, clauses)
        summary = generate_summary(text)
        overall_risk = get_overall_risk_level(risks)

        document_store[doc_id] = {
            "id": doc_id,
            "filename": file.filename,
            "text": text,
            "chunks": chunks,
            "faiss_index": index,
            "clauses": clauses,
            "risks": risks,
            "summary": summary,
            "overall_risk": overall_risk,
        }

        return {
            "document_id": doc_id,
            "filename": file.filename,
            "chunks_count": len(chunks),
            "clauses_count": len(clauses),
            "risks_count": len(risks),
            "overall_risk": overall_risk,
            "summary": summary,
            "clauses": clauses,
            "risks": risks,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.get("/api/documents")
def list_documents():
    """List all processed documents."""
    return [
        {
            "id": v["id"],
            "filename": v["filename"],
            "overall_risk": v["overall_risk"],
            "chunks_count": len(v["chunks"]),
            "clauses_count": len(v["clauses"]),
            "risks_count": len(v["risks"]),
        }
        for v in document_store.values()
    ]


@app.get("/api/document/{doc_id}")
def get_document(doc_id: str):
    """Get full analysis for a document."""
    doc = document_store.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found. It may have expired (server restarted).")
    return {
        "id": doc["id"],
        "filename": doc["filename"],
        "summary": doc["summary"],
        "clauses": doc["clauses"],
        "risks": doc["risks"],
        "overall_risk": doc["overall_risk"],
        "chunks_count": len(doc["chunks"]),
        "clauses_count": len(doc["clauses"]),
        "risks_count": len(doc["risks"]),
    }


class QueryRequest(BaseModel):
    document_id: str
    question: str
    language: str = "en"


@app.post("/api/query")
def query_document(req: QueryRequest):
    """Ask a question about a document using RAG."""
    doc = document_store.get(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    from rag.retriever import search_chunks
    from rag.qa import ask_question

    ctx = search_chunks(doc["faiss_index"], doc["chunks"], req.question, k=5)
    result = ask_question(req.question, ctx, req.language)
    return result
