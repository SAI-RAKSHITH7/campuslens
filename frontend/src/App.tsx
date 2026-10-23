import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { UploadSection } from './components/UploadSection'
import { ResultsView } from './components/ResultsView'
import { CalendarModal } from './components/CalendarModal'
import { ErrorAlert } from './components/ErrorAlert'
import type { NoticeAnalysisResponse } from './types'

// Configure API base URL from Vite environment, defaulting to local FastAPI port for dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function App() {
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'checking' | 'offline'>('checking')
  const [modelName, setModelName] = useState<string>('gemma-4-31b-it')
  const [analysis, setAnalysis] = useState<NoticeAnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorInfo, setErrorInfo] = useState<{
    title: string
    message: string
    suggestion?: string
    retryFn?: () => void
  } | null>(null)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false)

  // Health check on initial load
  const checkBackendHealth = async () => {
    try {
      setBackendStatus('checking')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        setBackendStatus('healthy')
        if (data.model) setModelName(data.model)
      } else {
        setBackendStatus('offline')
      }
    } catch {
      setBackendStatus('offline')
    }
  }

  useEffect(() => {
    checkBackendHealth()
  }, [])

  // Handle uploading and analyzing a real image
  const handleAnalyzeFile = async (file: File) => {
    setIsLoading(true)
    setErrorInfo(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errData: { error?: string; detail?: string; suggestion?: string } = {}
        try {
          errData = await response.json()
        } catch {
          errData = { detail: response.statusText }
        }

        if (response.status === 503) {
          setErrorInfo({
            title: 'Backend Configuration Required',
            message:
              errData.detail ||
              'GEMMA_API_KEY is not configured on the backend server.',
            suggestion:
              errData.suggestion ||
              'Set the GEMMA_API_KEY environment variable in Render or your backend .env file.',
            retryFn: () => handleAnalyzeFile(file),
          })
          return
        }

        if (response.status === 429) {
          setErrorInfo({
            title: 'Gemma 4 Quota Limit Reached',
            message:
              errData.detail ||
              'Hosted Gemma 4 rate limit was hit. Please wait a minute and retry.',
            suggestion: 'Free-tier Google Gen AI quotas replenish quickly. Wait 30 seconds and retry.',
            retryFn: () => handleAnalyzeFile(file),
          })
          return
        }

        if (response.status === 400 || response.status === 413) {
          setErrorInfo({
            title: 'Invalid File Upload',
            message:
              errData.detail ||
              'The uploaded file is not supported or exceeds the 10MB size limit.',
            suggestion: 'Upload a clear image in PNG, JPEG, or WEBP format under 10MB.',
          })
          return
        }

        throw new Error(
          errData.detail || `Server responded with status ${response.status}`
        )
      }

      const result: NoticeAnalysisResponse = await response.json()
      setAnalysis(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error'
      setErrorInfo({
        title: 'Unable to Connect to CampusLens Backend',
        message:
          backendStatus === 'offline'
            ? 'Backend is offline or waking up. If using Render free tier, spin-up may take 30-50 seconds.'
            : message,
        suggestion:
          'Ensure the backend service is running and accessible at ' +
          API_BASE_URL,
        retryFn: () => handleAnalyzeFile(file),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle instant pre-bundled sample selection
  const handleSelectSample = (sampleData: NoticeAnalysisResponse) => {
    setErrorInfo(null)
    setAnalysis(sampleData)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setAnalysis(null)
    setErrorInfo(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      <Header backendStatus={backendStatus} modelName={modelName} />

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

        {!analysis ? (
          <UploadSection
            onAnalyzeFile={handleAnalyzeFile}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
          />
        ) : (
          <ResultsView
            analysis={analysis}
            onReset={handleReset}
            onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
          />
        )}
      </main>

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        initialEvent={analysis?.suggested_calendar_event || null}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-6 mt-12 text-xs text-slate-500 text-center space-y-2">
        <p className="font-medium text-slate-700">
          CampusLens • Open-Source AI College Notice Assistant
        </p>
        <p>
          Released under the MIT License • Powered by hosted Gemma 4 via official Google Gen AI SDK.
        </p>
        <p className="text-[11px] text-slate-400">
          Always independently verify crucial circulars and examination dates with official college academic authorities.
        </p>
      </footer>
    </div>
  )
}
