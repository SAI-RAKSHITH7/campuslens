import io
import json
import logging
import os
import re
import time
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from google.genai.errors import APIError
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campuslens.serverless")

SERVER_START_TIME = time.time()
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}

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


class ActionItem(BaseModel):
    task: str
    deadline: Optional[str] = None
    priority: str = "medium"
    is_completed: bool = False


class EvidenceItem(BaseModel):
    topic: str
    quote_text: str
    context: Optional[str] = None


class CalendarEvent(BaseModel):
    title: str
    description: str
    start_iso: Optional[str] = None
    end_iso: Optional[str] = None
    location: Optional[str] = None
    is_confirmed_ready: bool = False
    date_type: str = "deadline"
    confidence_score: float = 1.0


class NoticeAnalysisResponse(BaseModel):
    title: str
    simple_summary: str
    event_date: Optional[str] = None
    registration_deadline: Optional[str] = "No deadline detected."
    is_deadline_certain: bool = False
    location: Optional[str] = None
    eligibility: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    action_checklist: List[ActionItem] = Field(default_factory=list)
    source_evidence: List[EvidenceItem] = Field(default_factory=list)
    missing_or_ambiguous_info: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggested_calendar_event: Optional[CalendarEvent] = None
    is_blurry_or_unreadable: bool = False


def clean_json_text(text: str) -> str:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    if not text.startswith("{"):
        first_b = text.find("{")
        last_b = text.rfind("}")
        if first_b != -1 and last_b != -1 and last_b > first_b:
            text = text[first_b:last_b + 1]
    return text


def get_gemma_client() -> tuple[genai.Client, str]:
    api_key = os.environ.get("GEMMA_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMMA_API_KEY is not configured in server environment.",
        )
    model_name = os.environ.get("GEMMA_MODEL", DEFAULT_GEMMA_MODEL)
    return genai.Client(api_key=api_key), model_name


async def run_gemma_inference(image_bytes: bytes, mime_type: str) -> NoticeAnalysisResponse:
    client, model_name = get_gemma_client()

    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    contents = [image_part, types.Part.from_text(text=ANALYSIS_SCHEMA_PROMPT)]
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.1,
        response_mime_type="application/json",
    )

    try:
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )
    except APIError as exc:
        err = str(exc)
        logger.error(f"Gemma API error: {err}")
        if "500" in err and model_name != FALLBACK_GEMMA_MODEL:
            logger.info(f"Retrying with fallback model {FALLBACK_GEMMA_MODEL}")
            response = await client.aio.models.generate_content(
                model=FALLBACK_GEMMA_MODEL,
                contents=contents,
                config=config,
            )
        elif "RESOURCE_EXHAUSTED" in err or "429" in err:
            raise HTTPException(status_code=429, detail="API rate limit reached. Please wait a minute.") from exc
        else:
            raise HTTPException(status_code=502, detail=f"AI service error: {err}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    raw_text = response.text or ""
    if not raw_text.strip():
        raise HTTPException(status_code=502, detail="Empty response from AI model.")

    cleaned = clean_json_text(raw_text)
    parsed = json.loads(cleaned)

    reg_dl = parsed.get("registration_deadline")
    if not reg_dl or reg_dl.lower() in ("null", "none", "n/a", "not specified", "not found"):
        parsed["registration_deadline"] = "No deadline detected."
        parsed["is_deadline_certain"] = False

    return NoticeAnalysisResponse.model_validate(parsed)


app = FastAPI(title="CampusLens Serverless API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "campuslens-serverless-api",
        "model": os.environ.get("GEMMA_MODEL", DEFAULT_GEMMA_MODEL),
        "api_key_configured": bool(os.environ.get("GEMMA_API_KEY")),
        "uptime_seconds": round(time.time() - SERVER_START_TIME, 2),
    }


@app.post("/api/analyze")
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content_type = file.content_type or ""
    if content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image format. Upload PNG, JPG, or WEBP.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10MB limit.")

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()
        
        # Optimize image for fast inference (resize if > 1600px, convert to high-quality JPEG)
        with Image.open(io.BytesIO(image_bytes)) as img:
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            if max(img.size) > 1600:
                img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            opt_buf = io.BytesIO()
            img.save(opt_buf, format="JPEG", quality=85)
            image_bytes = opt_buf.getvalue()
            content_type = "image/jpeg"
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupt image file.")

    return await run_gemma_inference(image_bytes, content_type)
