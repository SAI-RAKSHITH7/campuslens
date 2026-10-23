import json
import logging
import os
import re
from typing import Optional

from google import genai
from google.genai import types
from google.genai.errors import APIError

try:
    from .models import NoticeAnalysisResponse, CalendarEvent
except ImportError:
    from models import NoticeAnalysisResponse, CalendarEvent

logger = logging.getLogger("campuslens.ai")

DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it"
FALLBACK_GEMMA_MODEL = "gemma-4-26b-a4b-it"

SYSTEM_INSTRUCTION = """You are CampusLens, an expert college notice and circular analyzer designed to help students understand campus documents with complete precision.

Your job is to analyze the provided image of a college notice, event poster, examination circular, or assignment sheet, and extract all vital information into structured JSON.

CRITICAL RULES:
1. NEVER invent, hallucinate, or assume missing information. If a deadline, date, or venue is not explicitly present, state that clearly or set it to null.
2. DISTINGUISH EVENT DATES FROM REGISTRATION/SUBMISSION DEADLINES:
   - "Event Date": When the festival, seminar, workshop, or exam actually happens.
   - "Registration Deadline": The cutoff date/time by which a student must register, submit documents, or pay fees.
3. If no registration or submission deadline is present, explicitly return "No deadline detected." for registration_deadline, and set is_deadline_certain to false.
4. If dates are conflicting, ambiguous (e.g. "next Friday", "tentative"), or blurry, flag them explicitly in the 'warnings' and 'missing_or_ambiguous_info' fields.
5. In 'source_evidence', provide direct quotes from the notice text justifying your extracted deadlines, fees, and requirements.
6. If the image is blurry, degraded, corrupted, or unreadable, set 'is_blurry_or_unreadable' to true and describe the readability issue in 'warnings'.
7. In 'suggested_calendar_event', create a structured event if a clear deadline or event date exists. If dates are tentative or ambiguous, set 'is_confirmed_ready' to false and add notes.

Return ONLY a valid JSON object matching the required schema, with no preamble or trailing commentary outside the JSON."""

ANALYSIS_SCHEMA_PROMPT = """Analyze this campus document image and output your findings in the following JSON format:

{
  "title": "Clear title of the notice or event",
  "simple_summary": "2-3 sentences plain-English summary explaining what students need to know.",
  "event_date": "Date/time of the event (or null if not applicable)",
  "registration_deadline": "Specific registration/submission deadline, or 'No deadline detected.'",
  "is_deadline_certain": true or false,
  "location": "Physical venue, hall number, or online link (or null if not mentioned)",
  "eligibility": ["Criteria 1", "Criteria 2"],
  "required_documents": ["Document/Requirement 1", "Document 2"],
  "action_checklist": [
    {
      "task": "Action description",
      "deadline": "Optional deadline for this step or null",
      "priority": "high" | "medium" | "low",
      "is_completed": false
    }
  ],
  "source_evidence": [
    {
      "topic": "Section or topic (e.g. Registration Deadline)",
      "quote_text": "Exact text quote from image",
      "context": "Context or relevance"
    }
  ],
  "missing_or_ambiguous_info": ["Missing info or ambiguity point"],
  "warnings": ["Warning about blurry text, impending deadline, or conflicting info"],
  "suggested_calendar_event": {
    "title": "Event or deadline title for calendar",
    "description": "Short description for calendar event",
    "start_iso": "YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS (or null)",
    "end_iso": "YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS (or null)",
    "location": "Location or null",
    "is_confirmed_ready": true or false,
    "date_type": "deadline" or "event",
    "confidence_score": 1.0
  },
  "is_blurry_or_unreadable": false
}
"""


class GemmaConfigurationError(Exception):
    """Raised when the Gemma API key or configuration is missing or invalid."""
    pass


class GemmaQuotaError(Exception):
    """Raised when Gemma API quota or rate limits are exceeded."""
    pass


class GemmaAPIError(Exception):
    """Raised when the hosted Gemma service returns an error."""
    pass


def clean_json_text(text: str) -> str:
    """Extract raw JSON text from potentially markdown-fenced LLM responses."""
    text = text.strip()
    
    # Remove markdown code block if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    
    # Fallback: find outer curly braces
    if not text.startswith("{"):
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            text = text[first_brace:last_brace + 1]
            
    return text


def get_gemma_client() -> tuple[genai.Client, str]:
    """Instantiate the official Google Gen AI SDK client with GEMMA_API_KEY."""
    api_key = os.environ.get("GEMMA_API_KEY")
    if not api_key:
        raise GemmaConfigurationError(
            "GEMMA_API_KEY is not configured on the backend server. "
            "Please set the GEMMA_API_KEY environment variable in your deployment environment (e.g., Render Dashboard or .env)."
        )
    
    model_name = os.environ.get("GEMMA_MODEL", DEFAULT_GEMMA_MODEL)
    client = genai.Client(api_key=api_key)
    return client, model_name


async def analyze_notice_image(image_bytes: bytes, mime_type: str) -> NoticeAnalysisResponse:
    """Send notice image bytes to hosted Gemma 4 API and return validated structured analysis."""
    client, model_name = get_gemma_client()
    
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type,
    )
    
    contents = [
        image_part,
        types.Part.from_text(text=ANALYSIS_SCHEMA_PROMPT),
    ]
    
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
    )
    
    try:
        # Use asynchronous client call
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )
    except APIError as exc:
        error_msg = str(exc)
        logger.error(f"Gemma API error with model {model_name}: {error_msg}")
        
        # If upstream Google endpoint returns 500 INTERNAL on 31B, retry with 26b-a4b-it
        if "500" in error_msg and model_name != FALLBACK_GEMMA_MODEL:
            logger.info(f"Retrying with fallback Gemma 4 model: {FALLBACK_GEMMA_MODEL}")
            try:
                response = await client.aio.models.generate_content(
                    model=FALLBACK_GEMMA_MODEL,
                    contents=contents,
                    config=config,
                )
            except Exception as retry_exc:
                logger.error(f"Fallback Gemma model failed: {retry_exc}")
                raise GemmaAPIError(f"Hosted Gemma 4 service returned an error: {str(retry_exc)}") from retry_exc
        elif "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg or "quota" in error_msg.lower():
            raise GemmaQuotaError("Gemma API quota limit exceeded. Please wait a minute and retry.") from exc
        else:
            raise GemmaAPIError(f"Hosted Gemma 4 service returned an error: {error_msg}") from exc
    except Exception as exc:
        logger.error(f"Unexpected error while communicating with Gemma API: {exc}")
        raise GemmaAPIError(f"Failed to communicate with Gemma 4 service: {str(exc)}") from exc
        
    raw_text = response.text or ""
    if not raw_text.strip():
        raise GemmaAPIError("Gemma 4 model returned an empty response. The image might be unreadable or corrupt.")

    cleaned_json = clean_json_text(raw_text)
    
    try:
        parsed_data = json.loads(cleaned_json)
    except json.JSONDecodeError as exc:
        logger.error(f"JSON decode error: {exc}. Raw text: {raw_text[:200]}")
        raise GemmaAPIError("Failed to parse structured JSON from Gemma 4 response.") from exc
    
    # Enforce contract: if no deadline detected, standardise text
    reg_dl = parsed_data.get("registration_deadline")
    if not reg_dl or reg_dl.lower() in ("null", "none", "n/a", "not specified", "not found", "no deadline"):
        parsed_data["registration_deadline"] = "No deadline detected."
        parsed_data["is_deadline_certain"] = False
        
    # Validate and return Pydantic schema
    validated_response = NoticeAnalysisResponse.model_validate(parsed_data)
    return validated_response
