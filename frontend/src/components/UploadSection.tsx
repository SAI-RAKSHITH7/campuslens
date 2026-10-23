import React, { useRef, useState } from 'react'
import {
  UploadCloud,
  FileImage,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Layers,
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
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      onAnalyzeFile(selectedFile)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-violet-600" />
          <span>Always-Online AI Notice Assistant</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Never miss an exam, circular deadline, or campus event again.
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          “Snap it. Understand it. Take action.”
        </p>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Upload any college notice, poster, or circular. Hosted Gemma 4 extracts simple summaries,
          filters real deadlines from event dates, flags conflicting information, and exports confirmed deadlines to your calendar.
        </p>
      </div>

      {/* Upload Box */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-violet-500 bg-violet-50/50 scale-[1.01]'
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Drop your notice or poster image here
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, JPEG, WEBP up to 10MB
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition">
                    <FileImage className="w-3.5 h-3.5" />
                    <span>Browse Image File</span>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-start gap-4">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Notice preview"
                        className="w-24 h-24 object-cover rounded-lg border border-slate-200 shadow-sm shrink-0"
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
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for Gemma 4 analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {fileError}
                </p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  !selectedFile || isLoading
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-500/25 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing with Gemma 4...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Analyze Notice with Gemma 4</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sample Notice Selection - Instant Demo */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 justify-center">
          <Layers className="w-4 h-4 text-violet-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Quick Interactive Demo (Pre-bundled Notices)
          </h2>
        </div>
        <p className="text-xs text-slate-500 text-center max-w-xl mx-auto">
          Don&apos;t have a notice image handy? Click any of these 3 realistic campus notice scenarios to test CampusLens immediately.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {SAMPLE_NOTICES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample.data, sample.title)}
              className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sample.badgeColor}`}>
                    {sample.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition">
                  {sample.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-600 group-hover:translate-x-0.5 transition">
                <span>Test this notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works workflow */}
      <div className="max-w-4xl mx-auto pt-8 border-t border-slate-200">
        <h3 className="text-center font-bold text-slate-900 text-lg mb-8">
          How CampusLens Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Snap or Upload</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload event posters, exam timetables, hackathon flyers, or assignment briefs.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Hosted Gemma 4 AI</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google&apos;s hosted multimodal Gemma 4 parses text, distinguishes deadlines from event dates, and flags ambiguities.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Take Action & Export</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow the action checklist, verify details, and export confirmed dates to Google Calendar or Apple Calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
