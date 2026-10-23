import io
import json
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from unittest.mock import AsyncMock, patch

from backend.main import app
from backend.ai_service import (
    GemmaAPIError,
    GemmaConfigurationError,
    GemmaQuotaError,
)
from backend.models import NoticeAnalysisResponse

client = TestClient(app)


def create_test_image_bytes(color="white", size=(200, 200), format="PNG") -> bytes:
    """Helper to generate dummy valid image bytes in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()


def test_health_endpoint():
    """Verify GET /health returns 200 and expected health metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "campuslens-backend"
    assert "version" in data
    assert "model" in data
    assert "api_key_configured" in data
    assert "uptime_seconds" in data


def test_analyze_invalid_mime_type():
    """Verify that uploading non-image files (e.g. plain text or PDF) triggers 400."""
    response = client.post(
        "/analyze",
        files={"file": ("notice.txt", b"This is plain text", "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_analyze_empty_file():
    """Verify that uploading a 0-byte file triggers 400."""
    response = client.post(
        "/analyze",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400
    assert "uploaded file is empty" in response.json()["detail"]


def test_analyze_corrupt_image():
    """Verify that uploading random non-image bytes claiming to be PNG triggers 400."""
    response = client.post(
        "/analyze",
        files={"file": ("corrupt.png", b"NOT_A_REAL_PNG_HEADER", "image/png")},
    )
    assert response.status_code == 400
    assert "corrupted or not a valid image" in response.json()["detail"]


def test_analyze_missing_api_key_returns_503():
    """Verify that when GEMMA_API_KEY is unset, a 503 is returned with clear instructions."""
    img_bytes = create_test_image_bytes()
    
    with patch("backend.main.analyze_notice_image", side_effect=GemmaConfigurationError("GEMMA_API_KEY is not configured")):
        response = client.post(
            "/analyze",
            files={"file": ("notice.png", img_bytes, "image/png")},
        )
        assert response.status_code == 503
        data = response.json()
        assert data["error"] == "ConfigurationError"
        assert "Configure GEMMA_API_KEY" in data["suggestion"]


def test_analyze_quota_error_returns_429():
    """Verify that Gemma rate limits or quota errors return 429."""
    img_bytes = create_test_image_bytes()
    
    with patch("backend.main.analyze_notice_image", side_effect=GemmaQuotaError("Quota exceeded")):
        response = client.post(
            "/analyze",
            files={"file": ("notice.png", img_bytes, "image/png")},
        )
        assert response.status_code == 429
        data = response.json()
        assert data["error"] == "QuotaExceeded"


def test_analyze_upstream_api_error_returns_502():
    """Verify that upstream Gemma connection or API errors return 502."""
    img_bytes = create_test_image_bytes()
    
    with patch("backend.main.analyze_notice_image", side_effect=GemmaAPIError("Remote connection dropped")):
        response = client.post(
            "/analyze",
            files={"file": ("notice.png", img_bytes, "image/png")},
        )
        assert response.status_code == 502
        data = response.json()
        assert data["error"] == "UpstreamAIError"


def test_analyze_valid_notice():
    """Verify complete parsing of a valid campus notice with dates, actions, and evidence."""
    img_bytes = create_test_image_bytes()
    mock_response = NoticeAnalysisResponse(
        title="Annual Tech Symposium 2026",
        simple_summary="Department of CSE is hosting a national symposium with paper presentations and a hackathon.",
        event_date="2026-11-15",
        registration_deadline="2026-11-05 23:59 IST",
        is_deadline_certain=True,
        location="Auditorium B, Engineering Block",
        eligibility=["All undergraduate engineering students", "Teams of 2-4 members"],
        required_documents=["College ID Card", "Bonafide Certificate"],
        action_checklist=[
            {"task": "Form a team of 2-4", "deadline": "2026-11-03", "priority": "high", "is_completed": False},
            {"task": "Submit project abstract online", "deadline": "2026-11-05", "priority": "high", "is_completed": False},
        ],
        source_evidence=[
            {"topic": "Deadline", "quote_text": "Last date for online submission: 05/11/2026", "context": "Bottom poster footer"}
        ],
        missing_or_ambiguous_info=[],
        warnings=[],
        suggested_calendar_event={
            "title": "Registration Deadline: Annual Tech Symposium 2026",
            "description": "Submit project abstract and team details.",
            "start_iso": "2026-11-05T23:59:00",
            "end_iso": "2026-11-05T23:59:00",
            "location": "Auditorium B, Engineering Block",
            "is_confirmed_ready": True,
            "date_type": "deadline",
            "confidence_score": 1.0,
        },
        is_blurry_or_unreadable=False,
    )

    with patch("backend.main.analyze_notice_image", new=AsyncMock(return_value=mock_response)):
        response = client.post(
            "/analyze",
            files={"file": ("hackathon.png", img_bytes, "image/png")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Annual Tech Symposium 2026"
        assert data["is_deadline_certain"] is True
        assert len(data["action_checklist"]) == 2
        assert data["suggested_calendar_event"]["is_confirmed_ready"] is True


def test_analyze_notice_with_no_deadline():
    """Verify that when no deadline is present, 'No deadline detected.' is enforced."""
    img_bytes = create_test_image_bytes()
    mock_response = NoticeAnalysisResponse(
        title="Guest Lecture on Quantum Computing",
        simple_summary="Open guest lecture by Prof. Ramanathan. Walk-in attendance is permitted.",
        event_date="2026-10-30 14:00",
        registration_deadline="No deadline detected.",
        is_deadline_certain=False,
        location="Seminar Hall 1",
        eligibility=["Open to all students"],
        required_documents=[],
        action_checklist=[
            {"task": "Attend lecture on time", "deadline": None, "priority": "medium", "is_completed": False}
        ],
        source_evidence=[
            {"topic": "Admission", "quote_text": "Entry is free on first-come first-served basis.", "context": "Body paragraph"}
        ],
        missing_or_ambiguous_info=["No registration link or prior RSVP required."],
        warnings=[],
        suggested_calendar_event={
            "title": "Guest Lecture on Quantum Computing",
            "description": "Open seminar at Seminar Hall 1.",
            "start_iso": "2026-10-30T14:00:00",
            "end_iso": "2026-10-30T16:00:00",
            "location": "Seminar Hall 1",
            "is_confirmed_ready": True,
            "date_type": "event",
            "confidence_score": 0.95,
        },
        is_blurry_or_unreadable=False,
    )

    with patch("backend.main.analyze_notice_image", new=AsyncMock(return_value=mock_response)):
        response = client.post(
            "/analyze",
            files={"file": ("seminar.png", img_bytes, "image/png")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["registration_deadline"] == "No deadline detected."
        assert data["is_deadline_certain"] is False


def test_analyze_blurry_or_unreadable_notice():
    """Verify handling of blurry, unreadable images."""
    img_bytes = create_test_image_bytes()
    mock_response = NoticeAnalysisResponse(
        title="Unreadable Notice",
        simple_summary="The notice image appears severely blurry or low-resolution.",
        event_date=None,
        registration_deadline="No deadline detected.",
        is_deadline_certain=False,
        location=None,
        eligibility=[],
        required_documents=[],
        action_checklist=[],
        source_evidence=[],
        missing_or_ambiguous_info=["All text sections are too low-resolution to transcribe."],
        warnings=["Image text is unreadable due to blurriness or compression artifacts."],
        suggested_calendar_event=None,
        is_blurry_or_unreadable=True,
    )

    with patch("backend.main.analyze_notice_image", new=AsyncMock(return_value=mock_response)):
        response = client.post(
            "/analyze",
            files={"file": ("blurry.png", img_bytes, "image/png")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_blurry_or_unreadable"] is True
        assert len(data["warnings"]) > 0


def test_analyze_conflicting_dates():
    """Verify handling of notices with conflicting or ambiguous dates."""
    img_bytes = create_test_image_bytes()
    mock_response = NoticeAnalysisResponse(
        title="Mid-term Examination Schedule Update",
        simple_summary="Conflicting dates detected between the circular header and the timetable table.",
        event_date="2026-11-10 (Conflicting with 2026-11-12 in table)",
        registration_deadline="No deadline detected.",
        is_deadline_certain=False,
        location="Exam Halls",
        eligibility=["All 3rd Year Students"],
        required_documents=["Hall Ticket"],
        action_checklist=[
            {"task": "Verify exam date with HOD / Academic office", "deadline": None, "priority": "high", "is_completed": False}
        ],
        source_evidence=[
            {"topic": "Header", "quote_text": "Exams commence on 10 Nov", "context": "Subject line"},
            {"topic": "Timetable", "quote_text": "First paper scheduled for 12 Nov", "context": "Row 1 of schedule"}
        ],
        missing_or_ambiguous_info=["Header lists Nov 10 start date, but timetable lists Nov 12."],
        warnings=["CONFLICTING DATES: Header states Nov 10 whereas schedule states Nov 12."],
        suggested_calendar_event=None,
        is_blurry_or_unreadable=False,
    )

    with patch("backend.main.analyze_notice_image", new=AsyncMock(return_value=mock_response)):
        response = client.post(
            "/analyze",
            files={"file": ("exam.png", img_bytes, "image/png")},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["missing_or_ambiguous_info"]) > 0
        assert any("CONFLICTING" in w for w in data["warnings"])
