import React, { useEffect, useRef, useState } from 'react'
import { UserCheck, X, Save, GraduationCap, Building2, Hash, BookOpen } from 'lucide-react'
import type { StudentProfile } from '../types'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: StudentProfile
  onSaveProfile: (updated: StudentProfile) => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState(profile.name)
  const [department, setDepartment] = useState(profile.department)
  const [year, setYear] = useState(profile.year)
  const [rollNumber, setRollNumber] = useState(profile.rollNumber)

  useEffect(() => {
    setName(profile.name)
    setDepartment(profile.department)
    setYear(profile.year)
    setRollNumber(profile.rollNumber)
  }, [profile])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }

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
    return () => dialog.removeEventListener('click', handleBackdropClick)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile({
      name,
      department,
      year,
      rollNumber,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: 'any' }}
      aria-labelledby="profileModalTitle"
      className="p-0 rounded-2xl shadow-2xl border border-slate-200 bg-white max-w-md w-[92vw] m-auto backdrop:bg-slate-950/60 backdrop:backdrop-blur-xs focus:outline-none"
      onClose={onClose}
    >
      <div className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 id="profileModalTitle" className="font-extrabold text-slate-900 text-base">
                Student Academic Profile
              </h3>
              <p className="text-xs text-slate-500">
                Used to personalize circular alerts & eligibility checks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Student Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Roll / Student ID</span>
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Year & Program</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                <option value="3rd Year (B.Tech)">3rd Year (B.Tech)</option>
                <option value="4th Year (Senior)">4th Year (Senior)</option>
                <option value="Postgraduate / M.Tech">Postgraduate / M.Tech</option>
                <option value="PhD / Research Scholar">PhD / Research Scholar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Department / Major</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 flex items-start gap-2 text-violet-900">
            <UserCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              CampusLens dynamically checks your branch and year against circular prerequisites to verify if you are eligible to register or write exams.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Academic Profile</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
