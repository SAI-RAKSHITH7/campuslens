import React from 'react'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

interface ErrorAlertProps {
  errorTitle: string
  errorMessage: string
  suggestion?: string
  onRetry?: () => void
  onDismiss: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  errorTitle,
  errorMessage,
  suggestion,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-6 p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm text-rose-950 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-rose-900">{errorTitle}</h3>
          <p className="text-xs text-rose-800 mt-1 leading-relaxed">{errorMessage}</p>
          {suggestion && (
            <p className="text-xs text-rose-700/90 font-medium mt-2 bg-rose-100/60 p-2 rounded-lg border border-rose-200/60">
              💡 {suggestion}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-rose-200/60">
        <button
          onClick={onDismiss}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-800 hover:bg-rose-100/80 font-medium text-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  )
}
