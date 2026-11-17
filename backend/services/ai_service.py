"""Optional Gemini integration. The app remains usable without an API key."""
import json
from typing import Any
from backend.config import settings

async def generate_diagnosis(evidence_package: dict[str, Any]) -> dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        return {"ai_available": False, "mode": "rules_only", "message": "Gemini API key is not configured; deterministic findings were used."}

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = f'''You are NetSage AI, an evidence-driven network troubleshooting assistant.
Use only supplied evidence. Do not invent configuration or command output. Treat rule findings as evidence, not proof unless directly demonstrated. Never execute or claim to execute changes. Return JSON only with keys: category, root_cause, confidence, osi_layer, evidence, recommended_commands, proposed_remediation, historical_case_analysis, uncertainties, human_review_required.
EVIDENCE PACKAGE:\n{json.dumps(evidence_package, indent=2, ensure_ascii=False)}'''
        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json", "temperature": settings.LLM_TEMPERATURE},
        )
        content = (response.text or "").strip()
        result = json.loads(content)
        result["ai_available"] = True
        result["model"] = settings.GEMINI_MODEL
        return result
    except Exception as exc:
        return {"ai_available": False, "mode": "rules_fallback", "error": str(exc), "message": "Gemini was unavailable; deterministic findings were used."}
