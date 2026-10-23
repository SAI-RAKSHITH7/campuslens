import io
import logging
import os
import time
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError

from .ai_service import (
    DEFAULT_GEMMA_MODEL,
    GemmaAPIError,
    GemmaConfigurationError,
    GemmaQuotaError,
    analyze_notice_image,
)
from .models import NoticeAnalysisResponse

# Load environment variables from .env file if present
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("campuslens.server")

SERVER_START_TIME = time.time()
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}

app = FastAPI(
    title="CampusLens API",
    version="1.0.0",
    description="Open-Source AI Notice Assistant Backend powered by hosted Gemma 4",
)

# Configure CORS
env_origins = os.environ.get("CORS_ORIGINS", "")
if env_origins:
    origins: List[str] = [orig.strip() for orig in env_origins.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend status, model configuration, and uptime."""
    api_key_configured = bool(os.environ.get("GEMMA_API_KEY"))
    model_name = os.environ.get("GEMMA_MODEL", DEFAULT_GEMMA_MODEL)
    uptime = time.time() - SERVER_START_TIME
    
    return {
        "status": "healthy",
        "service": "campuslens-backend",
        "version": "1.0.0",
        "model": model_name,
        "api_key_configured": api_key_configured,
        "uptime_seconds": round(uptime, 2),
    }


@app.post(
    "/analyze",
    response_model=NoticeAnalysisResponse,
    tags=["Analysis"],
    summary="Analyze campus notice or event circular image",
)
async def analyze_notice(
    file: UploadFile = File(..., description="Image file of the college notice, poster, or circular"),
):
    """
    Accepts an uploaded notice image, performs validation,
    and queries the hosted Gemma 4 model to extract structured data.
    """
    # 1. Validate MIME type
    content_type = file.content_type or ""
    if content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file format '{content_type}'. "
                f"Please upload an image (PNG, JPEG, WEBP, or BMP)."
            ),
        )

    # 2. Read bytes into memory with size check
    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please select a valid document image.",
        )
        
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size limit of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB.",
        )

    # 3. Validate image integrity with PIL
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()
    except (UnidentifiedImageError, Exception) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is corrupted or not a valid image format.",
        ) from exc

    # 4. Invoke hosted Gemma 4 analysis
    try:
        analysis_result = await analyze_notice_image(image_bytes, content_type)
        return analysis_result
    except GemmaConfigurationError as exc:
        logger.error("Configuration error in AI service: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "error": "ConfigurationError",
                "detail": str(exc),
                "suggestion": "Configure GEMMA_API_KEY in the server environment variables.",
            },
        )
    except GemmaQuotaError as exc:
        logger.warning("Gemma API quota limit reached: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "QuotaExceeded",
                "detail": str(exc),
                "suggestion": "Please wait a short while for API quota reset.",
            },
        )
    except GemmaAPIError as exc:
        logger.error("Gemma API error during analysis: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "error": "UpstreamAIError",
                "detail": str(exc),
            },
        )
    except Exception as exc:
        logger.exception("Unexpected error processing image: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "detail": "An internal error occurred while processing the notice. Please try again.",
            },
        )
