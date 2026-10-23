import { describe, it, expect } from 'vitest'
import { generateIcsContent } from '../utils/icsGenerator'

describe('iCalendar (.ics) Generator', () => {
  it('generates valid RFC 5545 iCalendar content with start and end times', () => {
    const ics = generateIcsContent({
      title: 'HackNova 2026 Submission Deadline',
      description: 'Submit abstract and repository links.\nBring student ID.',
      location: 'Main Auditorium, Innovation Block',
      startIso: '2026-11-05T23:59:00Z',
      endIso: '2026-11-05T23:59:00Z',
    })

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//CampusLens//Open-Source AI Notice Assistant//EN')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:HackNova 2026 Submission Deadline')
    expect(ics).toContain('LOCATION:Main Auditorium\\, Innovation Block')
    expect(ics).toContain('STATUS:CONFIRMED')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('escapes special characters correctly in summary and description', () => {
    const ics = generateIcsContent({
      title: 'Exam; Revision, Part 1 & 2',
      description: 'First line\nSecond line; with semicolon, and comma.',
      startIso: '2026-12-01T10:00:00',
    })

    expect(ics).toContain('SUMMARY:Exam\\; Revision\\, Part 1 & 2')
    expect(ics).toContain('First line\\nSecond line\\; with semicolon\\, and comma.')
  })

  it('defaults end time to 1 hour after start if endIso is not provided', () => {
    const ics = generateIcsContent({
      title: 'Guest Lecture',
      description: 'Walk-in seminar',
      startIso: '2026-10-30T14:00:00Z',
    })

    expect(ics).toContain('DTSTART:20261030T140000Z')
    expect(ics).toContain('DTEND:20261030T150000Z')
  })
})
