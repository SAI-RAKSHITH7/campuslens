/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string and triggers a browser download.
 */

function formatToIcsDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) {
      // Fallback: strip dashes and colons
      return isoString.replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  } catch {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export interface IcsExportOptions {
  title: string
  description: string
  location?: string | null
  startIso: string
  endIso?: string | null
}

export function generateIcsContent(options: IcsExportOptions): string {
  const dtStamp = formatToIcsDate(new Date().toISOString())
  const dtStart = formatToIcsDate(options.startIso)
  
  // If endIso is provided use it, otherwise default to 1 hour after start
  let dtEnd = dtStart
  if (options.endIso) {
    dtEnd = formatToIcsDate(options.endIso)
  } else {
    try {
      const startDate = new Date(options.startIso)
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        dtEnd = formatToIcsDate(endDate.toISOString())
      }
    } catch {
      dtEnd = dtStart
    }
  }

  const uid = `campuslens-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@campuslens.app`
  const summary = escapeIcsText(options.title || 'Campus Notice Event')
  const description = escapeIcsText(
    `${options.description}\n\n[Exported via CampusLens - Always-Online AI Notice Assistant]`
  )
  const location = options.location ? escapeIcsText(options.location) : ''

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusLens//Open-Source AI Notice Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
  ]

  if (location) {
    lines.push(`LOCATION:${location}`)
  }

  lines.push('STATUS:CONFIRMED')
  lines.push('TRANSP:OPAQUE')
  lines.push('END:VEVENT')
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
