import React, { useEffect, useRef, useState } from 'react'
import { Calendar, Clock, MapPin, AlertTriangle, Download, X } from 'lucide-react'
import type { CalendarEvent } from '../types'
import { downloadIcsFile, generateIcsContent } from '../utils/icsGenerator'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  initialEvent: CalendarEvent | null
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  initialEvent,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [title, setTitle] = useState('')
  const [startIso, setStartIso] = useState('')
  const [endIso, setEndIso] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isExported, setIsExported] = useState(false)

  // Populate state when event changes
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '')
      // Format to YYYY-MM-DDTHH:mm for datetime-local input if possible
      let start = initialEvent.start_iso || ''
      if (start && start.length === 10) {
        start = `${start}T09:00`
      } else if (start && start.includes('T')) {
        start = start.slice(0, 16)
      } else {
        start = new Date().toISOString().slice(0, 16)
      }
      setStartIso(start)

      let end = initialEvent.end_iso || start
      if (end && end.length === 10) {
        end = `${end}T17:00`
      } else if (end && end.includes('T')) {
        end = end.slice(0, 16)
      }
      setEndIso(end)

      setLocation(initialEvent.location || '')
      setDescription(initialEvent.description || '')
      setIsExported(false)
    }
  }, [initialEvent])

  // Sync dialog visibility and register light-dismiss fallback per Modern Web Guidance
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }

    // Modern Web Guidance fallback for browsers lacking native closedby support
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return
      const rect = dialog.getBoundingClientRect()
      const isInsideContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width

      if (!isInsideContent) {
        dialog.close()
        onClose()
      }
    }

    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [isOpen, onClose])

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startIso) return

    const icsContent = generateIcsContent({
      title,
      description,
      location,
      startIso,
      endIso,
    })

    const cleanFilename = (title || 'campus_event')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30)

    downloadIcsFile(cleanFilename, icsContent)
    setIsExported(true)
    setTimeout(() => {
      onClose()
      setIsExported(false)
    }, 1200)
  }

  if (!isOpen || !initialEvent) return null

  const isLowCertainty = !initialEvent.is_confirmed_ready || initialEvent.confidence_score < 0.85

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: 'any' }}
      aria-labelledby="calendarModalTitle"
      className="p-0 rounded-2xl shadow-2xl border border-slate-200 bg-white max-w-lg w-[92vw] m-auto backdrop:bg-slate-950/60 backdrop:backdrop-blur-xs focus:outline-none"
      onClose={onClose}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 id="calendarModalTitle" className="font-bold text-lg text-slate-900">
                Export to Calendar (.ics)
              </h3>
              <p className="text-xs text-slate-500">
                Confirm extracted date and details before downloading
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if date was uncertain or conflicting */}
        {isLowCertainty && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice: Unverified or Ambiguous Date</span>
              <p className="mt-0.5 text-amber-800">
                CampusLens detected potential date uncertainty or conflicting notices. Please verify the date and time below before saving to your calendar.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleExport} className="mt-4 space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event / Deadline Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start / Deadline</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startIso}
                onChange={(e) => setStartIso(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Date (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={endIso}
                onChange={(e) => setEndIso(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location / Venue</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Auditorium B, Online ERP, or Zoom link"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExported}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-medium shadow-md shadow-violet-500/20 transition text-xs"
            >
              <Download className="w-4 h-4" />
              <span>{isExported ? 'Exported!' : 'Confirm & Download .ics'}</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
