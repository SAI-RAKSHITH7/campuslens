import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ListTodo,
  FileText,
  Quote,
  ArrowLeft,
  CalendarPlus,
  ShieldAlert,
  UserCheck,
  FolderCheck,
  MessageSquare,
  BookmarkCheck,
  Split,
  Eye,
} from 'lucide-react'
import type { NoticeAnalysisResponse, StudentProfile } from '../types'

interface ResultsViewProps {
  analysis: NoticeAnalysisResponse
  profile: StudentProfile
  onReset: () => void
  onOpenCalendarModal: () => void
  onOpenChat: () => void
  onSaveToBoard?: () => void
  isSaved?: boolean
  imageSrc?: string
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  analysis,
  profile,
  onReset,
  onOpenCalendarModal,
  onOpenChat,
  onSaveToBoard,
  isSaved = false,
  imageSrc,
}) => {
  const [checklist, setChecklist] = useState(analysis.action_checklist || [])
  const [showOriginalImage, setShowOriginalImage] = useState(false)

  const toggleTask = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, is_completed: !item.is_completed } : item
      )
    )
  }

  const completedCount = checklist.filter((item) => item.is_completed).length
  const totalCount = checklist.length

  const hasWarnings =
    analysis.is_blurry_or_unreadable ||
    (analysis.warnings && analysis.warnings.length > 0) ||
    (analysis.missing_or_ambiguous_info && analysis.missing_or_ambiguous_info.length > 0)

  const isNoDeadline =
    !analysis.registration_deadline ||
    analysis.registration_deadline.toLowerCase().includes('no deadline')

  // Simple heuristic eligibility check against student's department and year
  const isEligibleHeuristic =
    analysis.eligibility.length === 0 ||
    analysis.eligibility.some(
      (e) =>
        e.toLowerCase().includes('all') ||
        e.toLowerCase().includes('undergraduate') ||
        e.toLowerCase().includes('engineering') ||
        e.toLowerCase().includes(profile.department.toLowerCase().split(' ')[0])
    )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {imageSrc && (
            <button
              type="button"
              onClick={() => setShowOriginalImage(!showOriginalImage)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              {showOriginalImage ? <Split className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showOriginalImage ? 'Hide Original Image' : 'View Original Document'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>Ask Notice AI</span>
          </button>

          {onSaveToBoard && (
            <button
              type="button"
              onClick={onSaveToBoard}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <BookmarkCheck className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-600' : ''}`} />
              <span>{isSaved ? 'Saved to Notice Board' : 'Save to Board'}</span>
            </button>
          )}

          {analysis.suggested_calendar_event && (
            <button
              type="button"
              onClick={onOpenCalendarModal}
              className="inline-flex items-center gap-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Export to Calendar (.ics)</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Split Document Preview */}
      {showOriginalImage && imageSrc && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Original Document Snapshot</span>
            <button
              type="button"
              onClick={() => setShowOriginalImage(false)}
              className="hover:text-white"
            >
              Close Preview
            </button>
          </div>
          <div className="max-h-96 overflow-auto flex justify-center bg-black/40 rounded-xl p-2">
            <img src={imageSrc} alt="Original circular" className="max-h-96 object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Warnings & Ambiguities Alert */}
      {hasWarnings && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Important Verification Warnings Detected</span>
          </div>

          <div className="text-xs space-y-1.5 pl-7">
            {analysis.is_blurry_or_unreadable && (
              <p className="font-semibold text-rose-700">
                • Notice readability alert: Portions of this circular image appeared blurry or degraded.
              </p>
            )}
            {analysis.warnings?.map((w, idx) => (
              <p key={idx} className="text-amber-800">
                • {w}
              </p>
            ))}
            {analysis.missing_or_ambiguous_info?.map((info, idx) => (
              <p key={idx} className="text-amber-700">
                • Ambiguity: {info}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main Notice Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
            Verified Circular Breakdown
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            {analysis.title}
          </h1>
        </div>

        <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {analysis.simple_summary}
        </p>

        {analysis.location && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-violet-600" />
            <span>Venue: {analysis.location}</span>
          </div>
        )}
      </div>

      {/* Dates & Deadline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deadline Card */}
        <div
          className={`p-5 rounded-3xl border transition-all ${
            isNoDeadline
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-gradient-to-br from-rose-50/60 to-orange-50/40 border-rose-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isNoDeadline ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-700'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Submission / Registration Deadline
              </span>
            </div>

            {!isNoDeadline && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  analysis.is_deadline_certain
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {analysis.is_deadline_certain ? 'Confirmed' : 'Verify with HOD'}
              </span>
            )}
          </div>

          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {analysis.registration_deadline || 'No deadline detected.'}
          </div>

          <p className="text-xs text-slate-500 mt-2">
            {isNoDeadline
              ? 'No cutoff date detected in this circular (open entry or walk-in session).'
              : 'Submissions or registrations after this date will be closed.'}
          </p>
        </div>

        {/* Event Date Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 text-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Event Occurrence Date
              </span>
            </div>
          </div>

          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {analysis.event_date || 'Date not specified'}
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Scheduled time when the actual program, test, or session takes place.
          </p>
        </div>
      </div>

      {/* Student Eligibility Profile Matcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Eligibility Assessment</h3>
              <p className="text-xs text-slate-500">
                Matched against your profile ({profile.name} • {profile.year})
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isEligibleHeuristic
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isEligibleHeuristic ? 'Profile Criteria Matched' : 'Check Branch Prerequisites'}
          </span>
        </div>

        {analysis.eligibility.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No restrictive eligibility terms specified.</p>
        ) : (
          <ul className="space-y-2 pt-1">
            {analysis.eligibility.map((crit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{crit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Action Checklist</h3>
              <p className="text-xs text-slate-500">
                Track deliverables required by this circular
              </p>
            </div>
          </div>

          {totalCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {completedCount} / {totalCount} completed
            </span>
          )}
        </div>

        {checklist.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No specific action items detected.</p>
        ) : (
          <div className="space-y-2 pt-1">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                  item.is_completed
                    ? 'bg-emerald-50/50 border-emerald-200 opacity-75'
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => toggleTask(idx)}
                  className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      item.is_completed ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {item.task}
                  </p>
                  {item.deadline && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {item.deadline}</span>
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    item.priority === 'high'
                      ? 'bg-rose-100 text-rose-700'
                      : item.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Required Documents */}
      {analysis.required_documents.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <FolderCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Required Documents & Items</h3>
          </div>
          <ul className="space-y-2 pt-1">
            {analysis.required_documents.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <FileText className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Verbatim Source Evidence */}
      {analysis.source_evidence && analysis.source_evidence.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supporting Source Quotes</h3>
              <p className="text-xs text-slate-500">
                Direct quotes transcribed from the notice image for student verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {analysis.source_evidence.map((evidence, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    {evidence.topic}
                  </span>
                  {evidence.context && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {evidence.context}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 italic border-l-2 border-violet-500 pl-2">
                  &ldquo;{evidence.quote_text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
