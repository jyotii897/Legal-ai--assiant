RISK_PATTERNS = {
    "Critical": {
        "unlimited liability": "Contract contains unlimited liability — no cap on financial exposure.",
        "without limitation": "Clause has no limitation on liability or obligations.",
        "irrevocable": "Irrevocable clause — rights cannot be withdrawn once granted.",
        "perpetual license": "Perpetual irrevocable license — permanent IP transfer risk.",
        "waives all rights": "Party waives all legal rights — extremely one-sided.",
        "sole and absolute discretion": "Sole discretion clause — counterparty has unchecked authority.",
    },
    "High": {
        "automatic renewal": "Auto-renewal detected — contract renews without active consent.",
        "auto-renew": "Auto-renewal detected — contract renews without active consent.",
        "non-refundable": "Non-refundable payments — no recourse for funds paid.",
        "no termination": "No termination rights — party cannot exit the agreement.",
        "solely responsible": "One party bears all responsibility — unbalanced risk.",
        "indemnify and hold harmless": "Broad indemnification — significant financial exposure.",
        "liquidated damages": "Liquidated damages clause — fixed penalty amounts apply.",
        "mandatory arbitration": "Mandatory arbitration — waives right to court proceedings.",
        "binding arbitration": "Binding arbitration — dispute resolution is restricted.",
    },
    "Medium": {
        "30 days notice": "30-day termination notice required.",
        "60 days notice": "60-day termination notice required.",
        "penalty": "Penalty clause detected — financial consequences for breach.",
        "late payment": "Late payment fees may apply.",
        "exclusive": "Exclusivity clause — limits ability to work with others.",
        "non-compete": "Non-compete obligations — restricts future activities.",
        "assignment": "Assignment clause — check if rights can be transferred.",
        "governing law": "Governing law may affect dispute resolution jurisdiction.",
    },
    "Low": {
        "mutual agreement": "Mutual agreement required — balanced clause.",
        "either party": "Either party rights — balanced termination rights.",
        "reasonable notice": "Reasonable notice period — standard practice.",
    },
}


def analyze_risks(chunks: list, clauses: list = None) -> list:
    findings, seen = [], set()
    for chunk in chunks:
        chunk_lower = chunk.lower()
        for level, patterns in RISK_PATTERNS.items():
            for pattern, explanation in patterns.items():
                if pattern in chunk_lower and pattern not in seen:
                    seen.add(pattern)
                    idx = chunk_lower.find(pattern)
                    s, e = max(0, idx - 80), min(len(chunk), idx + len(pattern) + 80)
                    findings.append({
                        "risk_level": level,
                        "pattern_found": pattern.title(),
                        "explanation": explanation,
                        "context": "..." + chunk[s:e].strip() + "...",
                    })

    order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    findings.sort(key=lambda x: order.get(x["risk_level"], 4))
    return findings


def get_overall_risk_level(findings: list) -> str:
    levels = [f["risk_level"] for f in findings]
    for level in ["Critical", "High", "Medium"]:
        if level in levels:
            return level
    return "Low"
