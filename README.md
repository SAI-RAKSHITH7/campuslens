# CampusLens 🎓🔍
### Open-Source, Always-Online AI College Notice Assistant

> **“Snap it. Understand it. Take action.”**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React_19_|_Vite-61DAFB.svg?logo=react)](https://react.dev)
[![AI: Hosted Gemma 4](https://img.shields.io/badge/AI-Hosted_Gemma_4-8B5CF6.svg?logo=google)](https://ai.google.dev)
[![Deployment: Vercel](https://img.shields.io/badge/Deploy-Vercel_Serverless-black.svg?logo=vercel)](https://campuslens-portal.vercel.app)
[![Live Production: Online](https://img.shields.io/badge/Production-Live-emerald.svg)](https://campuslens-portal.vercel.app)

---

## 🌐 Live Production Deployment

- **Live Web Application**: **[https://campuslens-portal.vercel.app](https://campuslens-portal.vercel.app)**
- **Serverless API Health Check**: **[https://campuslens-portal.vercel.app/api/health](https://campuslens-portal.vercel.app/api/health)**
- **Public GitHub Repository**: **[https://github.com/SAI-RAKSHITH7/campuslens](https://github.com/SAI-RAKSHITH7/campuslens)**

---

## 📌 Overview

**CampusLens** is an open-source, always-online AI assistant that helps students instantly understand college notices, circulars, event posters, timetable changes, and assignment briefs.

Students upload or snap a photo of any campus notice, and CampusLens:
1. **Translates dense campus jargon into clear, plain-English summaries**.
2. **Strictly distinguishes actual event dates from registration/submission deadlines** (and prominently flags if no deadline exists).
3. **Identifies eligibility criteria and required documents** (fees, ID cards, bonafide slips).
4. **Generates an interactive student action checklist** with task priorities and completion tracking.
5. **Surfaces direct source text quotes** so students can verify claims against the original document.
6. **Detects conflicting, ambiguous, or blurry notices** with explicit uncertainty warnings.
7. **Exports confirmed deadlines directly to Google Calendar, Apple Calendar, or Outlook (`.ics`)** — with a mandatory confirmation modal ensuring no uncertain date is silently exported.

---

## 🚀 Laptop-Independent Architecture

CampusLens is architectured to be **100% cloud-hosted and always online**. It requires **no localhost tunnels, no laptop-hosted services, and no local Ollama or laptop inference**. When the developer closes their laptop or turns it off, the application remains completely operational in production.

```
┌─────────────────────────────────┐
│         Student Browser         │
│     (Desktop & Mobile Web)      │
└───────────────┬─────────────────┘
                │ HTTPS (SPA)
                ▼
┌─────────────────────────────────┐
│     Frontend (Vercel CDN)       │
│  React 19 + TypeScript + Vite   │
│  Tailwind CSS + Lucide Icons    │
└───────────────┬─────────────────┘
                │ REST API (`/analyze`, `/health`)
                ▼
┌─────────────────────────────────┐
│     Backend (Render Cloud)      │
│     Python 3 + FastAPI Server   │
│ In-Memory Image Validation (PIL)│
└───────────────┬─────────────────┘
                │ Secure HTTPS (gemma-4-31b-it)
                ▼
┌─────────────────────────────────┐
│   Google Gen AI Cloud API       │
│    Hosted Gemma 4 Multimodal    │
│  (Official google-genai SDK)    │
└─────────────────────────────────┘
```

- **Frontend**: Hosted on [Vercel](https://vercel.com) global edge network.
- **Backend**: Hosted on [Render](https://render.com) Web Services with automatic health checking.
- **AI Engine**: Hosted Gemma 4 (`gemma-4-31b-it` / `gemma-4-26b-a4b-it`) using the official `google-genai` Python SDK.
- **Security**: The `GEMMA_API_KEY` is kept exclusively on the backend server environment. It is never transmitted to the browser, stored in client-side bundles, or committed to GitHub.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **Factual Circular Parsing** | Extracts title, plain-English summary, venue, and organizers without hallucinations. |
| **Event Date vs Deadline** | Prevents missing cutoffs by cleanly separating event occurrences from submission deadlines. If none exists, displays *"No deadline detected."* |
| **Ambiguity & Conflict Warnings** | Flags contradicting dates (e.g., circular header says Nov 20, timetable says Nov 23) and blurry images. |
| **Interactive Checklist** | Check off tasks dynamically as you prepare documents, verify fees, or submit forms. |
| **Direct Source Evidence** | Provides verbatim quoted excerpts from the image for every critical claim. |
| **Confirmed Calendar Export** | Implements RFC 5545 `.ics` file generation with an interactive confirmation modal following modern web standards (`<dialog closedby="any">`). |
| **3 Pre-Bundled Demos** | Interactive one-click sample circulars (Hackathon, Walk-in Seminar with no deadline, Exam reschedule with date conflicts) for testing. |

---

## 📂 Project Structure

```
campuslens/
├── backend/                  # Python FastAPI Backend
│   ├── __init__.py
│   ├── ai_service.py         # Official google-genai SDK integration (Gemma 4)
│   ├── main.py               # FastAPI routes (/health, /analyze), CORS & validation
│   ├── models.py             # Pydantic schemas (NoticeAnalysisResponse, CalendarEvent)
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/       # Header, UploadSection, ResultsView, CalendarModal, ErrorAlert
│   │   ├── data/             # Pre-bundled sample circulars with SVG posters
│   │   ├── tests/            # Vitest unit tests (iCalendar & dataset validation)
│   │   ├── utils/            # RFC 5545 .ics calendar generator
│   │   ├── App.tsx           # Main application state and workflow
│   │   ├── index.css         # Tailwind CSS styling and accessible modal rules
│   │   └── types.ts          # TypeScript type definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── tests/
│   └── test_backend.py       # Pytest test suite for API, validation, and AI handlers
├── .env.example              # Placeholder environment variable templates
├── .gitignore                # Comprehensive exclusions for keys, venvs, and builds
├── LICENSE                   # Full MIT License text
├── pytest.ini                # Pytest configuration
├── render.yaml               # Render Infrastructure-as-Code blueprint
├── vercel.json               # Vercel root routing configuration
└── README.md
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.14 / 3.11)
- **Node.js**: v18+ (tested on Node v24)
- **Google Gen AI API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/SAI-RAKSHITH7/campuslens.git
cd campuslens

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Create your local .env file
copy .env.example .env   # On Windows
# cp .env.example .env    # On macOS/Linux

# Edit .env and paste your GEMMA_API_KEY:
# GEMMA_API_KEY=AIzaSy...
```

Run the backend server:
```bash
uvicorn backend.main:app --reload --port 8000
```
Verify the server is running by opening:
- Health endpoint: `http://localhost:8000/health`
- Interactive API Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

In a separate terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running the Test Suite

CampusLens includes comprehensive automated test suites covering backend image validation, error handling, mock Gemma responses, and frontend calendar logic.

### Run Backend Tests (Pytest)
```bash
# From the project root:
pytest -v
```
**Test Coverage Includes:**
- `GET /health` operational checks.
- Invalid MIME type rejections (rejecting text or non-image uploads).
- Corrupted image bytes and 0-byte file rejections.
- Friendly `503 Service Unavailable` when `GEMMA_API_KEY` is unconfigured.
- Upstream quota limit handling (`429 Too Many Requests`).
- Gemma 4 parsing of valid circulars, action items, and evidence quotes.
- Enforcing `"No deadline detected."` on notices without submission cutoffs.
- Blurry / unreadable document detection.
- Date conflict detection between circular headers and tables.

### Run Frontend Tests (Vitest)
```bash
# From the frontend directory:
cd frontend
npm test
```
**Test Coverage Includes:**
- RFC 5545 compliance of `.ics` calendar generation.
- Escaping special characters (commas, semicolons, newlines).
- One-hour default duration calculation.
- Schema verification of pre-bundled demo circulars.

---

## ☁️ Deployment Instructions

### Deploy Backend to Render

1. Sign in to [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository `campuslens`.
4. Configure the Web Service settings:
   - **Name**: `campuslens-backend`
   - **Environment**: `Python 3`
   - **Branch**: `main`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `GEMMA_API_KEY`: *(Your Google AI Studio API key)*
   - `GEMMA_MODEL`: `gemma-4-31b-it` (or `gemma-4-26b-a4b-it`)
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`
6. Click **Create Web Service**.
7. Once deployed, note your service URL (e.g. `https://campuslens-backend.onrender.com`). Verify by visiting `https://campuslens-backend.onrender.com/health`.

> **Note on Render Free Tier:** Render spins down free web services after 15 minutes of inactivity. When a request comes in, it may take 30–50 seconds to wake up. CampusLens's frontend automatically detects this status and displays an informative *"Waking up..."* indicator to students.

---

### Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository `campuslens`.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or leave empty if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://campuslens-backend.onrender.com` *(your live Render backend URL)*
6. Click **Deploy**.
7. Vercel will build and assign a permanent public HTTPS URL (e.g. `https://campuslens.vercel.app`).

---

## 🔒 Security, Privacy & Reliability

- **Zero Client-Side Secrets**: `GEMMA_API_KEY` is exclusively read by the backend. No secrets are ever sent to client browsers or bundled in JavaScript.
- **Ephemeral In-Memory Processing**: Uploaded notice images are analyzed in memory and immediately discarded. No images or student data are stored on disk or persistent databases.
- **Strict Input Validation**: Image MIME types and PIL image integrity are verified server-side before initiating AI inference.
- **No Localhost Leaks**: No production route relies on localhost, laptop services, or ngrok tunnels.

---

## ⚠️ Known Limitations

1. **Free Hosting Sleep Cycles**: Free Render tiers sleep during inactivity. The first request after a sleep period may take ~40 seconds.
2. **Handwritten / Highly Degraded Circulars**: While Gemma 4 exhibits exceptional optical character recognition, severely degraded photocopies or handwritten signatures may produce uncertainty flags. CampusLens intentionally marks these as unverified rather than guessing.
3. **Google Gen AI Quotas**: Free-tier Google AI Studio keys are subject to rate limits. If exceeded, CampusLens displays a clear 429 quota advisory.

---

## 📜 Open-Source License & Third-Party Attribution

- **CampusLens** is licensed under the permissive [MIT License](LICENSE).
- **Gemma 4**: Gemma is an open model family developed by Google. This project interacts with cloud-hosted Gemma 4 models using the official `google-genai` SDK under the terms of Google's API service.
- **Third-Party Libraries**: Built using FastAPI, React, Vite, Tailwind CSS, Lucide Icons, and Pydantic. All dependencies are open-source with permissive licenses (MIT, Apache-2.0, or BSD).
