# SchemeSaathi – Your Personal Government Scheme Assistant

> **Hackathon Edition** · Grounded Civic AI, Deterministic Rule Engine & Multimodal Citizen Protection

SchemeSaathi is a full-stack, end-to-end civic SaaS platform designed to help Indian citizens—especially in Andhra Pradesh and across India—discover, verify, and apply for government welfare schemes without confusing jargon, eligibility guesswork, or falling victim to WhatsApp scams.

---

## 🏛️ Key Capabilities

- **Deterministic Rule Engine (Python):** Pure mathematical evaluation of age, income, state, district, occupation, land ownership, and category against gazette criteria. AI explains outcomes but cannot alter rule judgments.
- **Family Benefit Finder:** Evaluates multi-member households independently without cross-leakage. Includes one-click demonstration of the standard 4-member family (Farmer Father, Homemaker Mother, Student Daughter, Senior Grandfather).
- **Multimodal Scam Shield:** Analyzes suspicious WhatsApp messages, fake payment links, and predatory flyers using Gemini Vision & NLP to detect fake registration fees, lookalike domains, and OTP traps.
- **Document Intelligence & Rejection Guard:** Multi-file audit (Aadhaar, income certificates, land deeds) for spelling/name mismatches, expired certificates, and missing prerequisites before submission.
- **PDF Scheme Simplifier:** PyMuPDF extraction + grounded AI simplification of 50-page official gazette PDFs with page citations and follow-up Q&A via Supabase pgvector RAG.
- **Conflict Detector & Change Monitor:** Detects contradictions across official sources and logs real historical policy amendments.
- **Application Journey Tracker:** 9-stage verified state machine requiring user confirmation for critical submission milestones.
- **Downloadable PDF Dossier:** Generates official branded citizen impact reports using ReportLab.

---

## 💻 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Web Speech API (Voice I/O).
- **Backend:** FastAPI (Python 3.13), Pydantic v2, PyMuPDF, ReportLab, SlowAPI rate-limiting.
- **Database & Auth:** PostgreSQL via Supabase, Row Level Security (RLS), pgvector for semantic retrieval.
- **AI / Grounding:** Google Gemini (`gemini-2.0-flash` & `text-embedding-004`) running strictly backend-side.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A free Supabase project with `vector` extension enabled
- A Google Gemini API key

### 2. Database Setup
1. Open your Supabase project dashboard -> **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql` to create all tables, indexes, and RLS policies.
3. Run `supabase/seed.sql` to populate initial verified Central & Andhra Pradesh scheme datasets and conflict records.

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend API documentation will be available at: `http://localhost:8000/api/docs`.

### 4. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Automated Testing

To run the backend test suite:
```bash
cd backend
python tests/test_runner.py
```
Validates deterministic eligibility rules across all supported schemes including income ceilings, age brackets, occupation checks, and missing parameter detection.

---

## 📋 Mandatory 12-Step Hackathon Demo Script

Follow this exact sequence for a judge presentation:

| Step | Action | Page / Feature | Expected Result | Backend / Engine Involved |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Open application & sign in | `/auth/login` | Click "Use Demo Account". Logs in as `demo@schemesaathi.in`. | Supabase Auth JWT |
| **2** | Explore Main Dashboard | `/dashboard` | View metrics: Potentially Eligible Schemes, Household Count, Active Journeys. | Profile & Matchmaker APIs |
| **3** | Seed 4-Member Demo Family | `/family` | Click "Reset 4-Member Demo Family". Seeds Father, Mother, Daughter, Grandfather. | `routers/family.py` (`/seed-demo`) |
| **4** | Run Family Benefit Finder | `/family` | Click "Re-run Evaluation". Each member evaluated independently without cross-leakage. | `routers/schemes.py` |
| **5** | View Scheme Discovery | `/schemes` | Filter by "Andhra Pradesh" and "Central Schemes". View required documents & official portals. | Scheme Catalog Service |
| **6** | Check Deterministic Eligibility | `/eligibility` | Select "PM-KISAN", enter Farmer, ₹80k income. Shows "Potentially Eligible" + rule evidence. | `services/eligibility_engine.py` |
| **7** | Ask AI Civic Agent (Voice/Text)| `/agent` | Ask in English, Telugu, or Hindi: *"Am I eligible for Rythu Bharosa in AP?"* | Grounded Gemini RAG + Speech API |
| **8** | PDF Scheme Simplifier | `/simplifier` | Upload a government scheme PDF. Plain-English summary + citations appear. Ask a follow-up. | PyMuPDF + RAG Q&A |
| **9** | WhatsApp Scam Detection | `/scam` | Click "Load Sample Scam Forward" (₹250 fake PM-KISAN fee). Displays "SUSPICIOUS" verdict. | Multimodal Gemini Vision |
| **10** | Document Rejection Guard | `/documents` | Upload demo ID certificates. Scans for name discrepancies and missing prerequisites. | Document Intelligence Engine |
| **11** | Conflict Detector | `/conflicts` | View side-by-side discrepancy on PM-KISAN income ceilings from two contradictory sources. | Multi-source Integrity Service |
| **12** | Download PDF Dossier | `/reports` | Click "Download Personal Scheme Dossier". Generates branded official citizen PDF report. | ReportLab Generator |

---

## 🔒 Security & Citizen Privacy Principles

1. **No Plaintext Sensitive IDs:** No Aadhaar numbers, PAN cards, OTPs, or bank passwords are ever logged or stored.
2. **Backend-Only AI Secrets:** Gemini and Supabase service-role keys are never exposed in frontend bundles.
3. **Citizen Data Sovereignty:** Users can permanently delete uploaded document audit records at any time.
4. **Authoritative Rule Integrity:** Gemini explains outcomes but is architecturally restricted from modifying deterministic rule decisions.
