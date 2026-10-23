from typing import List, Optional
from pydantic import BaseModel, Field


class ActionItem(BaseModel):
    task: str = Field(..., description="Actionable item to be done by the student")
    deadline: Optional[str] = Field(None, description="Specific deadline for this action item, if stated")
    priority: str = Field("medium", description="Priority level: high, medium, or low")
    is_completed: bool = Field(False, description="Whether the action item has been checked off")


class EvidenceItem(BaseModel):
    topic: str = Field(..., description="The subject or section from the notice")
    quote_text: str = Field(..., description="Exact or verbatim source text from the notice image")
    context: Optional[str] = Field(None, description="Where or why this text is relevant")


class CalendarEvent(BaseModel):
    title: str = Field(..., description="Clear, concise event or deadline title for the calendar")
    description: str = Field(..., description="Detailed description including requirements and links/venue")
    start_iso: Optional[str] = Field(None, description="Start date/time in ISO-8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")
    end_iso: Optional[str] = Field(None, description="End date/time in ISO-8601 format, or same as start_iso if single point in time")
    location: Optional[str] = Field(None, description="Physical venue or virtual meeting link")
    is_confirmed_ready: bool = Field(False, description="True only if date and time are unambiguously stated in the notice")
    date_type: str = Field("deadline", description="'deadline' for submission/registration, or 'event' for actual event date")
    confidence_score: float = Field(1.0, description="Confidence score from 0.0 to 1.0 regarding date accuracy")


class NoticeAnalysisResponse(BaseModel):
    title: str = Field(..., description="Official or inferred title of the notice/circular/poster")
    simple_summary: str = Field(..., description="Plain-English, student-friendly explanation of the notice in 2-4 sentences")
    event_date: Optional[str] = Field(None, description="Date when the event/exam/session actually takes place, or null if not applicable")
    registration_deadline: Optional[str] = Field("No deadline detected.", description="Registration or submission deadline, or 'No deadline detected.'")
    is_deadline_certain: bool = Field(False, description="Whether the deadline was explicitly stated without ambiguity")
    location: Optional[str] = Field(None, description="Location, hall, room, or online URL mentioned")
    eligibility: List[str] = Field(default_factory=list, description="Eligibility criteria for participating students (branches, years, prerequisites)")
    required_documents: List[str] = Field(default_factory=list, description="Documents, fees, or materials required (e.g. ID card, fee receipt, resume)")
    action_checklist: List[ActionItem] = Field(default_factory=list, description="Step-by-step checklist of actions students need to complete")
    source_evidence: List[EvidenceItem] = Field(default_factory=list, description="Direct supporting excerpts from the notice image")
    missing_or_ambiguous_info: List[str] = Field(default_factory=list, description="Missing details like missing venue, unclear timings, or contradictory instructions")
    warnings: List[str] = Field(default_factory=list, description="Warnings about blurry text, impending deadlines, conflicting dates, or unverified information")
    suggested_calendar_event: Optional[CalendarEvent] = Field(None, description="Structured event payload for export to calendar (.ics)")
    is_blurry_or_unreadable: bool = Field(False, description="Flag indicating if the image was partially or fully unreadable")
