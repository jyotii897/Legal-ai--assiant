from google import genai
import os

SUMMARY_PROMPT = """You are an expert legal analyst. Analyze the following contract and provide a structured summary.

CONTRACT TEXT:
{text}

Provide summary in this format:

**PARTIES INVOLVED:**
[All parties mentioned]

**KEY OBLIGATIONS:**
[Main obligations of each party]

**PAYMENT TERMS:**
[Payment details, amounts, schedules]

**TERMINATION CONDITIONS:**
[How and when contract can be terminated]

**IMPORTANT DEADLINES:**
[Key dates and timeframes]

**OVERALL RISK ASSESSMENT:**
[Low / Medium / High / Critical with brief reason]

Only include information actually present in the document. Be concise and professional."""


def generate_summary(text: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Summary unavailable: GEMINI_API_KEY not configured."

    if len(text) > 28000:
        text = text[:28000] + "\n...[truncated]"

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=SUMMARY_PROMPT.format(text=text),
            config={"temperature": 0.2}
        )
        return response.text
    except Exception as e:
        return f"Summary generation failed: {str(e)}"
