import { describe, it, expect } from 'vitest'
import { SAMPLE_NOTICES } from '../data/sampleNotices'

describe('Sample Notices Dataset', () => {
  it('contains exactly 3 pre-bundled realistic notices', () => {
    expect(SAMPLE_NOTICES).toHaveLength(3)
  })

  it('guarantees HackNova has confirmed registration deadline', () => {
    const hackathon = SAMPLE_NOTICES.find((n) => n.id === 'hacknova-2026')
    expect(hackathon).toBeDefined()
    expect(hackathon?.data.is_deadline_certain).toBe(true)
    expect(hackathon?.data.registration_deadline).toContain('November 05')
    expect(hackathon?.data.suggested_calendar_event?.is_confirmed_ready).toBe(true)
  })

  it('guarantees Quantum Seminar strictly outputs "No deadline detected."', () => {
    const seminar = SAMPLE_NOTICES.find((n) => n.id === 'quantum-seminar-2026')
    expect(seminar).toBeDefined()
    expect(seminar?.data.registration_deadline).toBe('No deadline detected.')
    expect(seminar?.data.is_deadline_certain).toBe(false)
    expect(seminar?.data.event_date).toBeDefined()
  })

  it('guarantees Exam Reschedule circular contains conflicting date warnings', () => {
    const examNotice = SAMPLE_NOTICES.find((n) => n.id === 'exam-timetable-conflicting')
    expect(examNotice).toBeDefined()
    expect(examNotice?.data.warnings.length).toBeGreaterThan(0)
    expect(examNotice?.data.is_deadline_certain).toBe(false)
    expect(examNotice?.data.missing_or_ambiguous_info.length).toBeGreaterThan(0)
  })
})
