import React from 'react'
import {
  ScanLine,
  LayoutGrid,
  CalendarClock,
  CheckSquare,
  User,
  Activity,
  PlusCircle,
} from 'lucide-react'
import type { ActiveTab, StudentProfile } from '../types'

interface NavbarProps {
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
  backendStatus: 'healthy' | 'checking' | 'offline'
  profile: StudentProfile
  onOpenProfile: () => void
  onNewScan: () => void
  deadlinesCount: number
  tasksCount: number
  noticesCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  backendStatus,
  profile,
  onOpenProfile,
  onNewScan,
  deadlinesCount,
  tasksCount,
  noticesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => onSelectTab('scanner')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-violet-700 flex items-center justify-center text-white shadow-md shadow-violet-500/15 group-hover:scale-105 transition">
                <ScanLine className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-violet-700 transition">
                  CampusLens
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  AI Campus Intelligence
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200">
              <button
                type="button"
                onClick={() => onSelectTab('scanner')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'scanner'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('feed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Notice Board</span>
                {noticesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'feed'
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {noticesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('deadlines')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'deadlines'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarClock className="w-4 h-4" />
                <span>Deadlines</span>
                {deadlinesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'deadlines'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {deadlinesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('tasks')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Action Planner</span>
                {tasksCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'tasks'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tasksCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Upload Action */}
            <button
              type="button"
              onClick={onNewScan}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-violet-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Scan Notice</span>
            </button>

            {/* Service Status Indicator */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {backendStatus === 'healthy'
                  ? 'Engine Online'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Standby Mode'}
              </span>
            </div>

            {/* Student Profile Trigger */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left"
              title="Student Profile & Eligibility Settings"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {profile.name ? profile.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {profile.name}
                </span>
                <span className="block text-[10px] text-slate-500 truncate max-w-[120px]">
                  {profile.year}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('scanner')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'scanner' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('feed')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'feed' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Notices ({noticesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('deadlines')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'deadlines' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Deadlines ({deadlinesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'tasks' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Planner ({tasksCount})</span>
          </button>
        </div>
      </div>
    </header>
  )
}
