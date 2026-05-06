import google.generativeai as genai
import json
import asyncio
from typing import Dict
from app.core.config import settings
from app.core.logger import app_logger
from app.core.exceptions.ai_exceptions import (
    GeminiAPIException,
    GeminiQuotaExceededException,
    AIResponseParseException
)

SYSTEM_PROMPT = """
You are a specialized legal document analyst for Indian 
government departments. Extract structured data from 
Indian court judgment text with forensic precision.

RESPOND ONLY IN VALID JSON. No preamble. No markdown. 
Raw JSON only.

Required JSON schema:
{
  "case_number": "exact as written",
  "court_name": "full court name",
  "date_of_order": "YYYY-MM-DD",
  "petitioner": "full name",
  "respondents": ["array of names"],
  "directives": [
    {
      "directive_id": "D001",
      "raw_text": "EXACT verbatim quote",
      "action_type": "COMPLIANCE|APPEAL|INFORMATION",
      "timeline_raw": "as written",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "department_hint": "which govt dept",
      "confidence_score": 0.0-1.0,
      "source_location": "Page X, Para Y"
    }
  ],
  "appeal_window": {
    "applicable": true,
    "deadline_raw": "as mentioned or null",
    "court": "appellate court or null"
  },
  "overall_nature": "COMPLIANCE_REQUIRED|APPEAL_WINDOW|INFORMATIONAL"
}

RULES — FOLLOW STRICTLY:
1. Extract ONLY what is explicitly written.
2. raw_text = verbatim quote, never paraphrased.
3. confidence_score: 1.0=crystal clear, 0.5=ambiguous, 0.2=inferred.
4. "forthwith"/"immediately" → CRITICAL priority, 3-day timeline.
5. "expeditiously" → HIGH priority, 30-day timeline.
6. Contempt petitions → ALL directives CRITICAL.
7. Case number formats: WP, CWP, SLP, PIL, FA, SA, RP, CP.
8. Hindi text → extract English portions, note Hindi in department_hint.
9. If field unclear → use null, never guess.
10. Number directives: D001, D002, D003...
"""

class GeminiOrchestrator:
    """
    AI Orchestrator for NyayaSetu using Google Gemini.
    Handles judgment DNA extraction with retry logic and demo mode fallbacks.
    """
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    async def extract_judgment_dna(self, full_text: str, order_date: str = "Unknown") -> dict:
        """
        Sends judgment text to Gemini and parses the structured response.
        Implements exponential backoff and demo mode logic.
        """
        if settings.DEMO_MODE:
            app_logger.info("Using cached demo response for GeminiOrchestrator")
            return self._get_cached_demo_response()
        
        # Trim text to stay within context limits if necessary
        truncated_text = full_text[:20000] 
        
        prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"ORDER DATE: {order_date}\n\n"
            f"JUDGMENT TEXT:\n{truncated_text}"
        )
        
        for attempt in range(3):
            try:
                response = self.model.generate_content(prompt)
                raw = response.text.strip()
                
                # Cleanup markdown formatting if AI includes it
                if raw.startswith("```"):
                    raw = raw.strip("`")
                    if raw.startswith("json"):
                        raw = raw[4:]
                
                return json.loads(raw.strip())
                
            except Exception as exc:
                err_msg = str(exc).lower()
                app_logger.warning(f"Gemini API attempt {attempt + 1} failed: {exc}")
                
                if "quota" in err_msg or "rate" in err_msg or "429" in err_msg:
                    if attempt == 2:
                        raise GeminiQuotaExceededException(details={"attempt": attempt + 1, "error": str(exc)})
                    await asyncio.sleep(2 ** (attempt + 1))
                else:
                    if attempt == 2:
                        raise GeminiAPIException(details={"error": str(exc)})
                    await asyncio.sleep(1)
        
        raise GeminiAPIException(details={"max_retries": 3})

    def _get_cached_demo_response(self) -> dict:
        """
        Returns a high-fidelity synthetic judgment DNA for demonstration purposes.
        """
        return {
            "case_number": "WP/1234/2024",
            "court_name": "High Court of Judicature at Bombay",
            "date_of_order": "2024-05-01",
            "petitioner": "Ram Shankar Tiwari",
            "respondents": [
                "State of Maharashtra",
                "Department of Finance",
                "Collector, Pune"
            ],
            "directives": [
                {
                    "directive_id": "D001",
                    "raw_text": "Respondents are directed to release pending salary dues of the petitioner within four weeks from the date of this order",
                    "action_type": "COMPLIANCE",
                    "timeline_raw": "four weeks",
                    "priority": "HIGH",
                    "department_hint": "Finance",
                    "confidence_score": 0.91,
                    "source_location": "Page 7, Para 3"
                },
                {
                    "directive_id": "D002",
                    "raw_text": "Respondent No. 3 shall file a compliance report before the next date of hearing",
                    "action_type": "COMPLIANCE",
                    "timeline_raw": "before next hearing",
                    "priority": "HIGH",
                    "department_hint": "Legal Cell",
                    "confidence_score": 0.88,
                    "source_location": "Page 8, Para 1"
                },
                {
                    "directive_id": "D003",
                    "raw_text": "The promotion case of the petitioner shall be considered in accordance with the seniority list within three months",
                    "action_type": "COMPLIANCE",
                    "timeline_raw": "three months",
                    "priority": "MEDIUM",
                    "department_hint": "HR",
                    "confidence_score": 0.79,
                    "source_location": "Page 8, Para 4"
                }
            ],
            "appeal_window": {
                "applicable": True,
                "deadline_raw": "ninety days",
                "court": "Supreme Court of India"
            },
            "overall_nature": "COMPLIANCE_REQUIRED"
        }
