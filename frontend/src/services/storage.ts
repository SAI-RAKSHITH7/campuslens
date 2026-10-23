import type { SavedNotice, StudentProfile } from '../types'
import { SAMPLE_NOTICES } from '../data/sampleNotices'

const STORAGE_KEYS = {
  NOTICES: 'campuslens_saved_notices_v1',
  PROFILE: 'campuslens_student_profile_v1',
}

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Alex Mercer',
  department: 'Computer Science & Engineering',
  year: '3rd Year (B.Tech)',
  rollNumber: 'CS23B1042',
}

export function loadSavedNotices(): SavedNotice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTICES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to load notices from localStorage, falling back to defaults:', err)
  }

  // Initial seed from campus notices
  const seeded: SavedNotice[] = SAMPLE_NOTICES.map((sample, idx) => ({
    id: sample.id,
    dateAdded: new Date(Date.now() - idx * 86400000 * 2).toISOString(),
    category:
      sample.category.includes('Competition')
        ? 'Competition'
        : sample.category.includes('Academic')
        ? 'Academic'
        : 'Administrative',
    imageSrc: sample.imageSrc,
    imageFileName: sample.imageFileName,
    analysis: sample.data,
    isStarred: idx === 0,
  }))

  saveNotices(seeded)
  return seeded
}

export function saveNotices(notices: SavedNotice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices))
  } catch (err) {
    console.error('Failed to save notices to localStorage:', err)
  }
}

export function loadProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE)
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
    }
  } catch (err) {
    console.warn('Failed to load profile:', err)
  }
  return DEFAULT_PROFILE
}

export function saveProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  } catch (err) {
    console.error('Failed to save profile:', err)
  }
}
