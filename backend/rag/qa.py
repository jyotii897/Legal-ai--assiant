from google import genai
import os

LEGAL_QA_PROMPT = """You are a Legal AI Assistant. Answer the question based STRICTLY on the contract context below.
If the answer is not in the context, say: "I cannot find this information in the provided document."
Do NOT hallucinate. Be precise and professional.

CONTRACT CONTEXT:
{context}

QUESTION: {question}

ANSWER:"""


def ask_question(question: str, context_chunks: list) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"answer": "GEMINI_API_KEY not configured on the server.", "citations": []}
    if not context_chunks:
        return {"answer": "No relevant context found in the document for this question.", "citations": []}

    context = "\n\n---\n\n".join(context_chunks)
    prompt = LEGAL_QA_PROMPT.format(context=context, question=question)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"temperature": 0.1}
        )
        return {
            "answer": response.text,
            "citations": [f"Chunk {i + 1}" for i in range(len(context_chunks))],
        }
    except Exception as e:
        return {"answer": f"AI query failed: {str(e)}", "citations": []}
