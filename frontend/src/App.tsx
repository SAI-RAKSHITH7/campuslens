import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { UploadSection } from './components/UploadSection'
import { ResultsView } from './components/ResultsView'
import { NoticeFeedView } from './components/NoticeFeedView'
import { DeadlinesView } from './components/DeadlinesView'
import { TasksPlannerView } from './components/TasksPlannerView'
import { CalendarModal } from './components/CalendarModal'
import { ProfileModal } from './components/ProfileModal'
import { NoticeChatDrawer } from './components/NoticeChatDrawer'
import { ErrorAlert } from './components/ErrorAlert'
import { loadSavedNotices, saveNotices, loadProfile, saveProfile } from './services/storage'
import type {
  ActiveTab,
  SavedNotice,
  StudentProfile,
  NoticeAnalysisResponse,
  ActionItem,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner')
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'checking' | 'offline'>('checking')
  const [notices, setNotices] = useState<SavedNotice[]>(loadSavedNotices)
  const [profile, setProfile] = useState<StudentProfile>(loadProfile)

  // Current active analysis in scanner
  const [currentAnalysis, setCurrentAnalysis] = useState<NoticeAnalysisResponse | null>(null)
  const [currentImageSrc, setCurrentImageSrc] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [errorInfo, setErrorInfo] = useState<{
    title: string
    message: string
    suggestion?: string
    retryFn?: () => void
  } | null>(null)

  // Modals & Drawers
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [calendarTargetEvent, setCalendarTargetEvent] = useState<SavedNotice | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false)

  // Health check on initial load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        setBackendStatus('checking')
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 6000)
        const res = await fetch(`${API_BASE_URL}/health`, { signal: ctrl.signal })
        clearTimeout(timer)
        if (res.ok) {
          setBackendStatus('healthy')
        } else {
          setBackendStatus('offline')
        }
      } catch {
        setBackendStatus('offline')
      }
    }
    checkBackend()
  }, [])

  // Sync notices to localStorage
  const updateNotices = (updated: SavedNotice[]) => {
    setNotices(updated)
    saveNotices(updated)
  }

  // Handle image upload and AI analysis
  const handleAnalyzeFile = async (file: File) => {
    setIsLoading(true)
    setErrorInfo(null)

    const formData = new FormData()
    formData.append('file', file)
    const localUrl = URL.createObjectURL(file)
    setCurrentImageSrc(localUrl)

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errData: { detail?: string; suggestion?: string } = {}
        try {
          errData = await response.json()
        } catch {
          errData = { detail: response.statusText }
        }

        if (response.status === 503) {
          setErrorInfo({
            title: 'Backend Service Notice',
            message: errData.detail || 'The AI service requires the GEMMA_API_KEY environment variable on the server.',
            suggestion: errData.suggestion || 'Add GEMMA_API_KEY to your backend configuration.',
            retryFn: () => handleAnalyzeFile(file),
          })
          return
        }

        if (response.status === 429) {
          setErrorInfo({
            title: 'API Rate Limit Reached',
            message: 'Hosted model rate limit reached. Please wait 30 seconds and retry.',
            suggestion: 'Free quotas replenish quickly. Click retry in a moment.',
            retryFn: () => handleAnalyzeFile(file),
          })
          return
        }

        throw new Error(errData.detail || `Server returned status ${response.status}`)
      }

      const result: NoticeAnalysisResponse = await response.json()
      setCurrentAnalysis(result)

      // Automatically auto-save analyzed notice to feed
      const newSavedNotice: SavedNotice = {
        id: `notice-${Date.now()}`,
        dateAdded: new Date().toISOString(),
        category: 'General',
        imageSrc: localUrl,
        imageFileName: file.name,
        analysis: result,
      }
      updateNotices([newSavedNotice, ...notices])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network communication error'
      setErrorInfo({
        title: 'Unable to Connect to Campus Intelligence Engine',
        message:
          backendStatus === 'offline'
            ? 'The backend server is offline or waking up. Please verify the API is running at ' + API_BASE_URL
            : message,
        suggestion: 'Make sure your backend server is running and CORS allows this origin.',
        retryFn: () => handleAnalyzeFile(file),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Pre-bundled circular select
  const handleSelectSample = (sampleData: NoticeAnalysisResponse) => {
    setErrorInfo(null)
    setCurrentAnalysis(sampleData)
    // Find matching notice imageSrc if already in database
    const existing = notices.find((n) => n.analysis.title === sampleData.title)
    setCurrentImageSrc(existing?.imageSrc)
    setActiveTab('scanner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Open existing notice in scanner
  const handleSelectNoticeFromFeed = (notice: SavedNotice) => {
    setCurrentAnalysis(notice.analysis)
    setCurrentImageSrc(notice.imageSrc)
    setActiveTab('scanner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete notice
  const handleDeleteNotice = (id: string) => {
    const updated = notices.filter((n) => n.id !== id)
    updateNotices(updated)
    if (currentAnalysis && notices.find((n) => n.id === id)?.analysis.title === currentAnalysis.title) {
      setCurrentAnalysis(null)
    }
  }

  // Toggle star
  const handleToggleStar = (id: string) => {
    const updated = notices.map((n) => (n.id === id ? { ...n, isStarred: !n.isStarred } : n))
    updateNotices(updated)
  }

  // Update task checkbox
  const handleUpdateNoticeTask = (noticeId: string, taskIndex: number, completed: boolean) => {
    const updated = notices.map((n) => {
      if (n.id === noticeId) {
        const checklist = [...n.analysis.action_checklist]
        if (checklist[taskIndex]) {
          checklist[taskIndex] = { ...checklist[taskIndex], is_completed: completed }
        }
        return {
          ...n,
          analysis: { ...n.analysis, action_checklist: checklist },
        }
      }
      return n
    })
    updateNotices(updated)

    if (currentAnalysis) {
      const currentInNotices = updated.find((n) => n.id === noticeId)
      if (currentInNotices && currentInNotices.analysis.title === currentAnalysis.title) {
        setCurrentAnalysis(currentInNotices.analysis)
      }
    }
  }

  // Add custom task
  const handleAddCustomTask = (noticeId: string, task: ActionItem) => {
    const updated = notices.map((n) => {
      if (n.id === noticeId) {
        return {
          ...n,
          analysis: {
            ...n.analysis,
            action_checklist: [...n.analysis.action_checklist, task],
          },
        }
      }
      return n
    })
    updateNotices(updated)
  }

  // Profile save
  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile)
    saveProfile(updatedProfile)
  }

  // Counts for navbar badges
  const deadlinesCount = notices.filter(
    (n) => n.analysis.suggested_calendar_event?.start_iso
  ).length

  const allTasks = notices.flatMap((n) => n.analysis.action_checklist || [])
  const pendingTasksCount = allTasks.filter((t) => !t.is_completed).length

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      {/* Product Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        backendStatus={backendStatus}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onNewScan={() => {
          setCurrentAnalysis(null)
          setActiveTab('scanner')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        deadlinesCount={deadlinesCount}
        tasksCount={pendingTasksCount}
        noticesCount={notices.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorInfo && (
          <ErrorAlert
            errorTitle={errorInfo.title}
            errorMessage={errorInfo.message}
            suggestion={errorInfo.suggestion}
            onRetry={errorInfo.retryFn}
            onDismiss={() => setErrorInfo(null)}
          />
        )}

        {/* Tab 1: Scanner & Active Analysis */}
        {activeTab === 'scanner' && (
          <div>
            {!currentAnalysis ? (
              <UploadSection
                onAnalyzeFile={handleAnalyzeFile}
                onSelectSample={handleSelectSample}
                isLoading={isLoading}
              />
            ) : (
              <ResultsView
                analysis={currentAnalysis}
                profile={profile}
                onReset={() => setCurrentAnalysis(null)}
                onOpenCalendarModal={() => {
                  const matchingNotice = notices.find(
                    (n) => n.analysis.title === currentAnalysis.title
                  )
                  setCalendarTargetEvent(matchingNotice || null)
                  setIsCalendarModalOpen(true)
                }}
                onOpenChat={() => setIsChatDrawerOpen(true)}
                imageSrc={currentImageSrc}
                isSaved={notices.some((n) => n.analysis.title === currentAnalysis.title)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Notice Feed & Board */}
        {activeTab === 'feed' && (
          <NoticeFeedView
            notices={notices}
            onSelectNotice={handleSelectNoticeFromFeed}
            onDeleteNotice={handleDeleteNotice}
            onToggleStar={handleToggleStar}
            onOpenCalendarModal={(notice) => {
              setCalendarTargetEvent(notice)
              setIsCalendarModalOpen(true)
            }}
            onNewScan={() => {
              setCurrentAnalysis(null)
              setActiveTab('scanner')
            }}
          />
        )}

        {/* Tab 3: Deadlines & Calendar Timeline */}
        {activeTab === 'deadlines' && (
          <DeadlinesView
            notices={notices}
            onOpenCalendarModal={(notice) => {
              setCalendarTargetEvent(notice)
              setIsCalendarModalOpen(true)
            }}
            onSelectNotice={handleSelectNoticeFromFeed}
          />
        )}

        {/* Tab 4: Tasks Planner */}
        {activeTab === 'tasks' && (
          <TasksPlannerView
            notices={notices}
            onUpdateNoticeTask={handleUpdateNoticeTask}
            onAddCustomTask={handleAddCustomTask}
            onSelectNotice={handleSelectNoticeFromFeed}
          />
        )}
      </main>

      {/* Calendar Export Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => {
          setIsCalendarModalOpen(false)
          setCalendarTargetEvent(null)
        }}
        initialEvent={
          calendarTargetEvent?.analysis.suggested_calendar_event ||
          currentAnalysis?.suggested_calendar_event ||
          null
        }
      />

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Notice AI Q&A Drawer */}
      {currentAnalysis && (
        <NoticeChatDrawer
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          notice={currentAnalysis}
        />
      )}

      {/* Professional SaaS Product Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <span className="font-extrabold text-slate-900 tracking-tight text-sm">
              CampusLens Intelligence
            </span>
            <p className="text-[11px] text-slate-400">
              Personalized college circular parsing, deadline tracking, and task management.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-600 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className="hover:text-slate-900 transition"
            >
              Notice Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className="hover:text-slate-900 transition"
            >
              Notice Board
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('deadlines')}
              className="hover:text-slate-900 transition"
            >
              Deadlines Timeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className="hover:text-slate-900 transition"
            >
              Action Planner
            </button>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-slate-900 transition"
            >
              Student Profile
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
