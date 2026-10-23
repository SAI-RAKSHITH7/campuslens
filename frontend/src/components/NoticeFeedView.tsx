import React, { useState } from 'react'
import {
  Search,
  Calendar,
  Clock,
  Sparkles,
  Star,
  Trash2,
  CalendarPlus,
  ArrowRight,
  Filter,
} from 'lucide-react'
import type { SavedNotice } from '../types'

interface NoticeFeedViewProps {
  notices: SavedNotice[]
  onSelectNotice: (notice: SavedNotice) => void
  onDeleteNotice: (id: string) => void
  onToggleStar: (id: string) => void
  onOpenCalendarModal: (notice: SavedNotice) => void
  onNewScan: () => void
}

export const NoticeFeedView: React.FC<NoticeFeedViewProps> = ({
  notices,
  onSelectNotice,
  onDeleteNotice,
  onToggleStar,
  onOpenCalendarModal,
  onNewScan,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.analysis.simple_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.analysis.location && n.analysis.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      categoryFilter === 'all' || n.category.toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Search */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Campus Notice Board
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified circulars, exam schedules, and activity deadlines
            </p>
          </div>

          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Scan New Circular</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search circulars, subjects, venues, or keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            {['all', 'Competition', 'Academic', 'Administrative'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-violet-100 text-violet-800 border border-violet-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Notices' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No notices matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filter, or scan a new circular image.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setCategoryFilter('all')
            }}
            className="text-xs text-violet-600 hover:text-violet-800 font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotices.map((notice) => {
            const isNoDeadline =
              !notice.analysis.registration_deadline ||
              notice.analysis.registration_deadline.toLowerCase().includes('no deadline')

            return (
              <div
                key={notice.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-violet-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 uppercase tracking-wider">
                      {notice.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleStar(notice.id)}
                        className={`p-1.5 rounded-lg transition ${
                          notice.isStarred
                            ? 'text-amber-500 fill-amber-500 hover:bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                        }`}
                        title="Star notice"
                      >
                        <Star className={`w-4 h-4 ${notice.isStarred ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteNotice(notice.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3
                      onClick={() => onSelectNotice(notice)}
                      className="font-bold text-slate-900 text-base group-hover:text-violet-700 transition cursor-pointer line-clamp-2"
                    >
                      {notice.analysis.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                      {notice.analysis.simple_summary}
                    </p>
                  </div>

                  {/* Dates Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline:</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          isNoDeadline ? 'text-slate-500' : 'text-rose-600'
                        }`}
                      >
                        {notice.analysis.registration_deadline}
                      </span>
                    </div>

                    {notice.analysis.event_date && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Event Date:</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[150px]">
                          {notice.analysis.event_date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectNotice(notice)}
                    className="inline-flex items-center gap-1.5 font-bold text-violet-700 hover:text-violet-900 group-hover:translate-x-0.5 transition"
                  >
                    <span>View Full Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {notice.analysis.suggested_calendar_event && (
                    <button
                      type="button"
                      onClick={() => onOpenCalendarModal(notice)}
                      className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition"
                      title="Export to Calendar (.ics)"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
