import React, { useEffect, useRef, useState } from 'react'
import {
  UploadCloud,
  FileImage,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Camera,
  Layers,
  Clipboard,
} from 'lucide-react'
import { SAMPLE_NOTICES } from '../data/sampleNotices'
import type { NoticeAnalysisResponse } from '../types'

interface UploadSectionProps {
  onAnalyzeFile: (file: File) => void
  onSelectSample: (sampleData: NoticeAnalysisResponse, sampleName: string) => void
  isLoading: boolean
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalyzeFile,
  onSelectSample,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Support Ctrl+V paste from clipboard (e.g. Windows Snipping Tool or screenshot)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0]
        if (file.type.startsWith('image/')) {
          validateAndSetFile(file)
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateAndSetFile = (file: File) => {
    setFileError(null)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
    if (!validTypes.includes(file.type)) {
      setFileError('Please select a valid image file (PNG, JPG, or WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File exceeds 10MB size limit. Please choose a smaller image.')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setFileError(null)
    if (inputRef.current) inputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      onAnalyzeFile(selectedFile)
    }
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Intelligent Notice Recognition Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Instant Campus Circular & Poster Intelligence
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Upload any circular, timetable update, or event poster. CampusLens extracts deadlines, explains rules in plain English, and maps confirmed dates to your calendar.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-violet-500 bg-violet-50/50 scale-[1.005]'
                    : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50/60'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/bmp"
                  onChange={handleChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleChange}
                  className="hidden"
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-violet-800 text-white flex items-center justify-center shadow-lg shadow-violet-500/15">
                  <UploadCloud className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Drop circular image here or browse
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, WEBP • Or press{' '}
                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 rounded border border-slate-300">
                    Ctrl + V
                  </kbd>{' '}
                  to paste screenshot
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition">
                    <FileImage className="w-3.5 h-3.5 text-violet-600" />
                    <span>Select File</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      cameraInputRef.current?.click()
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Camera Snap</span>
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-400 text-xs font-medium">
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Clipboard Paste Ready</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-start gap-4">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Notice preview"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Image'}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for deep circular extraction</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {fileError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-200">
                {fileError}
              </p>
            )}

            {/* Action CTA */}
            <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                !selectedFile || isLoading
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-800 hover:from-slate-800 hover:to-violet-700 active:scale-[0.99] shadow-violet-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing circular with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Analyze & Extract Notice</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Featured Department Circulars for Quick Examination */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Featured Department Circulars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_NOTICES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample.data, sample.title)}
              className="group bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  {sample.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition mt-2 line-clamp-2">
                  {sample.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-600 group-hover:translate-x-0.5 transition">
                <span>Inspect Circular</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
