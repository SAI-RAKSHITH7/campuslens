import type { SampleNotice } from '../types'

// Helper to encode SVG into data URI for mock posters
function createPosterSvg(title: string, sub: string, badge: string, bgGrad: [string, string]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad[0]}"/>
        <stop offset="100%" stop-color="${bgGrad[1]}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#grad)" rx="16"/>
    <rect x="30" y="30" width="540" height="740" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" rx="12"/>
    <rect x="50" y="50" width="160" height="34" rx="17" fill="rgba(255,255,255,0.2)"/>
    <text x="130" y="72" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${badge}</text>
    
    <text x="50" y="140" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#ffffff">${title.slice(0, 24)}</text>
    <text x="50" y="175" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#38bdf8">${title.slice(24, 50)}</text>
    
    <text x="50" y="225" font-family="system-ui, sans-serif" font-size="15" fill="#e2e8f0">${sub}</text>
    
    <rect x="50" y="270" width="500" height="1" fill="rgba(255,255,255,0.2)"/>
    
    <rect x="50" y="300" width="240" height="120" rx="10" fill="rgba(15,23,42,0.4)"/>
    <text x="70" y="335" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8" font-weight="600">OFFICIAL NOTICE</text>
    <text x="70" y="365" font-family="system-ui, sans-serif" font-size="18" fill="#ffffff" font-weight="bold">Department of CSE</text>
    <text x="70" y="395" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">Ref No: CL-2026/SEC-B</text>

    <rect x="310" y="300" width="240" height="120" rx="10" fill="rgba(15,23,42,0.4)"/>
    <text x="330" y="335" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8" font-weight="600">KEY CRITERIA</text>
    <text x="330" y="365" font-family="system-ui, sans-serif" font-size="18" fill="#34d399" font-weight="bold">Undergraduate</text>
    <text x="330" y="395" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">All branches eligible</text>

    <rect x="50" y="450" width="500" height="240" rx="12" fill="rgba(255,255,255,0.06)"/>
    <text x="80" y="490" font-family="system-ui, sans-serif" font-size="16" fill="#f8fafc" font-weight="bold">Important Directives & Timelines:</text>
    <text x="80" y="525" font-family="system-ui, sans-serif" font-size="14" fill="#cbd5e1">• Strict adherence to deadline is mandatory.</text>
    <text x="80" y="555" font-family="system-ui, sans-serif" font-size="14" fill="#cbd5e1">• Carry college ID card and verification slip.</text>
    <text x="80" y="585" font-family="system-ui, sans-serif" font-size="14" fill="#cbd5e1">• Submit deliverables via official portal only.</text>
    <text x="80" y="615" font-family="system-ui, sans-serif" font-size="14" fill="#cbd5e1">• For queries: campuslens-support@campus.edu</text>
    
    <text x="300" y="730" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Dean of Academic Affairs • CampusLens Verified Document</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const SAMPLE_NOTICES: SampleNotice[] = [
  {
    id: 'hacknova-2026',
    title: 'HackNova 2026: 36-Hour National Hackathon',
    category: 'Competition & Hackathon',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'National coding hackathon with cash prizes, team formation requirements, and clear registration cutoff.',
    imageFileName: 'sample_hacknova_poster.png',
    imageSrc: createPosterSvg(
      'HackNova 2026 National Hackathon',
      'Department of CSE • ₹1,00,000 Prize Pool',
      'TECH COMPETITION',
      ['#0f172a', '#3b0764']
    ),
    data: {
      title: 'HackNova 2026: 36-Hour National Inter-College Hackathon',
      simple_summary: 'Department of Computer Science is hosting a 36-hour national in-person hackathon with tracks in AI, Web3, and HealthTech. Teams of 2 to 4 undergraduate students are invited to register online before the deadline.',
      event_date: 'November 14-15, 2026',
      registration_deadline: 'November 05, 2026, 23:59 IST',
      is_deadline_certain: true,
      location: 'Main Auditorium & Innovation Lab (Block C)',
      eligibility: [
        'Enrolled full-time undergraduate students from any recognized university',
        'Teams must consist of 2 to 4 members',
        'Inter-departmental teams are allowed'
      ],
      required_documents: [
        'Valid College Student ID Card',
        'Official Bonafide Certificate or College Email verification',
        'Project Abstract (PDF, maximum 2 pages)'
      ],
      action_checklist: [
        {
          task: 'Form a team of 2-4 students and designate a team lead',
          deadline: 'November 03, 2026',
          priority: 'high',
          is_completed: false
        },
        {
          task: 'Submit project abstract and team roster on the registration portal',
          deadline: 'November 05, 2026',
          priority: 'high',
          is_completed: false
        },
        {
          task: 'Join the official participant Discord server for problem statements',
          deadline: 'November 12, 2026',
          priority: 'medium',
          is_completed: false
        },
        {
          task: 'Carry college ID card and laptops to Block C check-in',
          deadline: 'November 14, 2026 08:00 IST',
          priority: 'medium',
          is_completed: false
        }
      ],
      source_evidence: [
        {
          topic: 'Registration Deadline',
          quote_text: 'Strict cutoff: Online submissions close on 05-Nov-2026 at 23:59 IST. No extensions.',
          context: 'Section 4 - Registration Timelines'
        },
        {
          topic: 'Event Dates',
          quote_text: 'Hackathon commences on Saturday, November 14th at 09:00 AM and concludes November 15th at 06:00 PM.',
          context: 'Event Schedule Header'
        },
        {
          topic: 'Eligibility',
          quote_text: 'Open to all bona-fide BE/B.Tech/B.Sc/BCA students. Teams must have 2-4 members.',
          context: 'Section 2 - Participation Rules'
        }
      ],
      missing_or_ambiguous_info: [
        'Whether food and overnight accommodation are provided for outstation teams is not explicitly detailed.'
      ],
      warnings: [
        'Hard registration deadline approaching on Nov 5. Late registrations will not be entertained.'
      ],
      suggested_calendar_event: {
        title: 'Registration Deadline: HackNova 2026 Hackathon',
        description: 'Final cutoff to register your 2-4 member team and submit project abstract for HackNova 2026.',
        start_iso: '2026-11-05T23:59:00',
        end_iso: '2026-11-05T23:59:00',
        location: 'Innovation Lab (Block C)',
        is_confirmed_ready: true,
        date_type: 'deadline',
        confidence_score: 1.0
      },
      is_blurry_or_unreadable: false
    }
  },
  {
    id: 'quantum-seminar-2026',
    title: 'Guest Lecture: Quantum Algorithms & Future Computing',
    category: 'Academic Seminar (No Deadline)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Distinguished lecture series with open walk-in entry. Demonstrates CampusLens correctly flagging "No deadline detected".',
    imageFileName: 'sample_seminar_notice.png',
    imageSrc: createPosterSvg(
      'Quantum Algorithms Seminar',
      'Distinguished Speaker Series • Hall A',
      'GUEST LECTURE',
      ['#0f172a', '#064e3b']
    ),
    data: {
      title: 'Distinguished Guest Lecture: Quantum Algorithms and Practical Computing',
      simple_summary: 'Prof. K. Ramanathan from the National Institute of Science will deliver an open guest lecture on quantum algorithms and error correction. Admission is open and free for all students on a first-come, first-served basis.',
      event_date: 'October 30, 2026, 14:00 - 16:30 IST',
      registration_deadline: 'No deadline detected.',
      is_deadline_certain: false,
      location: 'Sir C.V. Raman Seminar Hall, Physics Block',
      eligibility: [
        'Open to all students, research scholars, and faculty members across all years and branches'
      ],
      required_documents: [
        'Physical student ID badge for building security access'
      ],
      action_checklist: [
        {
          task: 'Arrive at Sir C.V. Raman Seminar Hall 15 minutes prior for seating',
          deadline: 'October 30, 2026 13:45 IST',
          priority: 'medium',
          is_completed: false
        },
        {
          task: 'Bring a notebook or tablet for lecture notes',
          deadline: null,
          priority: 'low',
          is_completed: false
        }
      ],
      source_evidence: [
        {
          topic: 'Event Date & Venue',
          quote_text: 'Date: 30th October 2026 | Time: 2:00 PM to 4:30 PM | Venue: Sir C.V. Raman Seminar Hall.',
          context: 'Banner Header'
        },
        {
          topic: 'Registration Policy',
          quote_text: 'No prior registration or fee required. Seating is on first-come, first-served basis up to hall capacity (200 seats).',
          context: 'Footnote Note 1'
        }
      ],
      missing_or_ambiguous_info: [
        'No registration form or prior RSVP is required.',
        'Certificates of attendance are not explicitly mentioned.'
      ],
      warnings: [],
      suggested_calendar_event: {
        title: 'Guest Lecture: Quantum Algorithms (Prof. Ramanathan)',
        description: 'Open seminar on quantum computing in Sir C.V. Raman Seminar Hall. Free walk-in entry.',
        start_iso: '2026-10-30T14:00:00',
        end_iso: '2026-10-30T16:30:00',
        location: 'Sir C.V. Raman Seminar Hall, Physics Block',
        is_confirmed_ready: true,
        date_type: 'event',
        confidence_score: 0.95
      },
      is_blurry_or_unreadable: false
    }
  },
  {
    id: 'exam-timetable-conflicting',
    title: 'Urgent Circular: End-Sem Exam Reschedule (Date Conflict)',
    category: 'Official Circular (Conflicting Dates)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Circular with conflicting commencement dates between header and timetable table. Highlights CampusLens uncertainty warnings.',
    imageFileName: 'sample_conflicting_exam_circular.png',
    imageSrc: createPosterSvg(
      'End-Sem Exam Reschedule Notice',
      'Academic Affairs Branch • Circular #882',
      'CONFIDENTIAL / URGENT',
      ['#1e1b4b', '#7f1d1d']
    ),
    data: {
      title: 'Circular No. 882: Rescheduled End-Semester Examination Timetable',
      simple_summary: 'The Examination Controller has issued a revised schedule for odd-semester examinations. However, there is a discrepancy: the circular letter subject specifies exams start on November 20th, whereas Table 1 lists the first theory paper on November 23rd.',
      event_date: 'Tentatively November 20 or 23, 2026 (Conflicting)',
      registration_deadline: 'November 15, 2026 (Exam fee & hall ticket download)',
      is_deadline_certain: false,
      location: 'Central Examination Halls (Rooms 101-118)',
      eligibility: [
        'All 3rd and 5th Semester B.Tech students with minimum 75% attendance'
      ],
      required_documents: [
        'Printed Hall Ticket signed by Proctor/Mentor',
        'Fee clearance receipt from Finance Office',
        'Original Student Identity Card'
      ],
      action_checklist: [
        {
          task: 'Contact class representative or department HOD to clarify start date (Nov 20 vs Nov 23)',
          deadline: 'Immediate',
          priority: 'high',
          is_completed: false
        },
        {
          task: 'Verify no fee dues with Finance Office to unlock hall ticket generation',
          deadline: 'November 12, 2026',
          priority: 'high',
          is_completed: false
        },
        {
          task: 'Download and print examination hall ticket from student portal',
          deadline: 'November 15, 2026',
          priority: 'high',
          is_completed: false
        }
      ],
      source_evidence: [
        {
          topic: 'Header Subject Line',
          quote_text: 'Sub: Rescheduled dates for B.Tech End-Sem Exams starting 20th November 2026.',
          context: 'Letter Subject'
        },
        {
          topic: 'Timetable Table Row 1',
          quote_text: 'Course: CS301 Database Systems | Date: 23-Nov-2026 (Monday) | Time: 10:00 AM - 1:00 PM',
          context: 'Appended Timetable Schedule'
        },
        {
          topic: 'Hall Ticket Deadline',
          quote_text: 'Students must download hall tickets by 15-Nov-2026. Portal closes at 5:00 PM.',
          context: 'Directive 3'
        }
      ],
      missing_or_ambiguous_info: [
        'Date conflict between Notice Subject (Nov 20) and Timetable Schedule (Nov 23).',
        'Whether Nov 20-22 are reserved for practical laboratory exams is not clarified.'
      ],
      warnings: [
        'CONFLICTING DATES DETECTED: The notice subject mentions November 20, while the attached timetable starts on November 23. Do not book travel tickets until department confirms!',
        'Low date certainty: Calendar export should be double-checked with faculty.'
      ],
      suggested_calendar_event: {
        title: 'Hall Ticket Download Cutoff (B.Tech Exams)',
        description: 'Final date to download printed hall ticket. Notice contains conflicting exam start dates (Nov 20 vs 23) — verify with HOD.',
        start_iso: '2026-11-15T17:00:00',
        end_iso: '2026-11-15T17:00:00',
        location: 'Student ERP Portal',
        is_confirmed_ready: false,
        date_type: 'deadline',
        confidence_score: 0.65
      },
      is_blurry_or_unreadable: false
    }
  }
]
