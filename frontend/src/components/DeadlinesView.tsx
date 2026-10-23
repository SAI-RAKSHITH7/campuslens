import React, { useState } from 'react'
import {
  CalendarClock,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  ExternalLink,
  MapPin,
  CalendarPlus,
} from 'lucide-react'
import type { SavedNotice } from '../types'
import { generateIcsContent, downloadIcsFile } from '../utils/icsGenerator'

interface DeadlinesViewProps {
  notices: SavedNotice[]
  onOpenCalendarModal: (notice: SavedNotice) => void
  onSelectNotice: (notice: SavedNotice) => void
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  notices,
  onOpenCalendarModal,
  onSelectNotice,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'deadlines' | 'events'>('all')

  // Extract all calendar events from notices
  const items = notices
    .filter((n) => n.analysis.suggested_calendar_event)
    .map((n) => ({
      notice: n,
      event: n.analysis.suggested_calendar_event!,
      isDeadline: n.analysis.suggested_calendar_event!.date_type === 'deadline',
    }))

  const filteredItems = items.filter((item) => {
    if (filterType === 'deadlines') return item.isDeadline
    if (filterType === 'events') return !item.isDeadline
    return true
  })

  // Batch export all deadlines to a single combined .ics calendar file
  const handleBatchExport = () => {
    if (items.length === 0) return

    const combinedEvents = items.map((item) => {
      const singleIcs = generateIcsContent({
        title: item.event.title,
        description: item.event.description,
        location: item.event.location,
        startIso: item.event.start_iso || new Date().toISOString(),
        endIso: item.event.end_iso,
      })
      return singleIcs
    })

    // Create a master combined VCALENDAR
    const masterLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusLens//Master Deadlines Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    for (const single of combinedEvents) {
      const match = single.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/)
      if (match) {
        masterLines.push(match[0])
      }
    }

    masterLines.push('END:VCALENDAR')
    const finalContent = masterLines.join('\r\n')
    downloadIcsFile('campuslens_master_deadlines', finalContent)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <CalendarClock className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Campus Deadlines & Timeline
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            Never miss an assignment cutoff, contest registration, or fee deadline
          </p>
        </div>

        <button
          type="button"
          onClick={handleBatchExport}
          disabled={items.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export All to Calendar (.ics)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Timelines ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('deadlines')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'deadlines'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Submission Cutoffs Only
        </button>
        <button
          type="button"
          onClick={() => setFilterType('events')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'events'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Event Dates
        </button>
      </div>

      {/* Timeline List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No scheduled items found</h4>
          <p className="text-xs text-slate-500">
            Scan notices with deadlines to populate your calendar timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(({ notice, event, isDeadline }) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isDeadline
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {isDeadline ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isDeadline
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-violet-50 text-violet-700 border border-violet-200'
                      }`}
                    >
                      {isDeadline ? 'Submission Cutoff' : 'Event Session'}
                    </span>

                    {event.is_confirmed_ready ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        Review Date
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onSelectNotice(notice)}
                    className="font-bold text-slate-900 text-base hover:text-violet-700 cursor-pointer transition"
                  >
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.start_iso ? new Date(event.start_iso).toLocaleString() : 'Date pending'}</span>
                    </span>

                    {event.location && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectNotice(notice)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition flex items-center gap-1"
                >
                  <span>Notice</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenCalendarModal(notice)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
