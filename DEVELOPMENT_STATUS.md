# SchemeSaathi – Development Status

**Last Updated:** November 2026
**Architecture:** Next.js 14 (TypeScript, Tailwind CSS) + FastAPI (Python 3.13) + Supabase (PostgreSQL, pgvector, Auth, Storage) + Google Gemini AI (RAG, Vision, Multimodal)

---

## 1. Feature Completion Status

| Feature Area | Sub-Feature / Component | Status | Backend Service / Engine | Frontend Route |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Profile** | User Registration / Login (JWT) | ✅ Completed | `routers/auth_router.py` | `/auth/login`, `/auth/signup` |
| | Citizen Profile Master Data | ✅ Completed | `routers/profiles.py` | `/profile` |
| | User Settings & Language Preference | ✅ Completed | `routers/profiles.py` | `/settings` |
| **Family System** | Household Members CRUD | ✅ Completed | `routers/family.py` | `/family` |
| | 4-Member Demonstration Family Seed | ✅ Completed | `routers/family.py` (`/seed-demo`) | `/dashboard`, `/family` |
| **Deterministic Rules** | Pure Python Eligibility Engine | ✅ Completed | `services/eligibility_engine.py` | `/eligibility` |
| | Individual Evaluation (No Transfer) | ✅ Completed | `services/eligibility_engine.py` | `/family` |
| | Verification Status & Trust Engine | ✅ Completed | `services/eligibility_engine.py` | Throughout all views |
| **Scheme Discovery** | Scheme Catalog (Central & AP) | ✅ Completed | `routers/schemes.py` | `/schemes` |
| | Reverse Matchmaker against Profile | ✅ Completed | `routers/schemes.py` (`/match`) | `/dashboard` |
| | Scheme Comparison (Side-by-side) | ✅ Completed | `routers/schemes.py` | `/compare` |
| **AI Civic Agent** | Natural Language Scheme Q&A | ✅ Completed | `routers/agent.py` & `services/gemini.py` | `/agent` |
| | Multilingual (EN, TE, HI) | ✅ Completed | `services/gemini.py` | Universal across all UI |
| | Web Speech API (Voice I/O) | ✅ Completed | Frontend Web Speech API | `/agent` |
| | Evidence Citations & Trust Labels | ✅ Completed | `routers/agent.py` | `/agent` |
| **Document Intelligence** | Document Readiness & Rejection Guard | ✅ Completed | `routers/documents.py` | `/documents` |
| | PDF Scheme Simplifier | ✅ Completed | `routers/simplifier.py` | `/simplifier` |
| | Interactive PDF Q&A (RAG) | ✅ Completed | `routers/simplifier.py` & `rag_service.py`| `/simplifier` |
| | User-controlled Document Deletion | ✅ Completed | `routers/documents.py` | `/documents` |
| **Scam Protection** | Multimodal Scam Shield (Vision/Text) | ✅ Completed | `routers/scam.py` & `services/gemini.py` | `/scam` |
| | WhatsApp/SMS Phishing Identification| ✅ Completed | `services/gemini.py` | `/scam` |
| **Accountability & Integrity**| Information Conflict Detector | ✅ Completed | `routers/conflicts.py` | `/conflicts` |
| | Scheme Change Monitor | ✅ Completed | `routers/monitor.py` | `/monitor` |
| | 9-Stage Application Journey Tracker | ✅ Completed | `routers/journey.py` | `/journey` |
| | Downloadable PDF Dossier Report | ✅ Completed | `routers/reports.py` (ReportLab) | `/reports` |
| **Administration** | Role-Protected Admin Dashboard | ✅ Completed | `routers/admin.py` | `/admin` |
| | Real Database Telemetry & Audit Logs | ✅ Completed | `routers/admin.py` | `/admin` |

---

## 2. API Integration Status

| Router | Prefix | Status | Authentication Requirement |
| :--- | :--- | :--- | :--- |
| Auth Router | `/api/auth` | ✅ Active | Public (signup, login, refresh) |
| Profiles | `/api/profiles` | ✅ Active | User Bearer JWT |
| Family | `/api/family` | ✅ Active | User Bearer JWT |
| Schemes | `/api/schemes` | ✅ Active | Public list; User JWT for `/match` & `/family-benefit-finder` |
| Eligibility | `/api/eligibility` | ✅ Active | User Bearer JWT |
| AI Agent | `/api/agent` | ✅ Active | User Bearer JWT |
| Scam Shield | `/api/scam` | ✅ Active | User Bearer JWT |
| Documents | `/api/documents` | ✅ Active | User Bearer JWT |
| Simplifier | `/api/simplifier` | ✅ Active | User Bearer JWT |
| Journey | `/api/journey` | ✅ Active | User Bearer JWT |
| Reports | `/api/reports` | ✅ Active | User Bearer JWT |
| Conflicts | `/api/conflicts` | ✅ Active | Public GET; User JWT for POST |
| Monitor | `/api/monitor` | ✅ Active | Public GET |
| Admin | `/api/admin` | ✅ Active | Role='admin' Bearer JWT |

---

## 3. Database Integration Status

- **Database Provider:** PostgreSQL via Supabase
- **Extensions:** `uuid-ossp`, `pgvector`
- **Schema Migration File:** `supabase/migrations/001_initial_schema.sql`
- **Initial Seed Dataset:** `supabase/seed.sql`
  - Includes 11 verified Central and Andhra Pradesh government schemes.
  - Sample information conflicts and historical policy change audits pre-seeded.
  - Demonstrates Row-Level Security (RLS) across all user profiles, family members, and private document uploads.

---

## 4. Test Verification Summary

- **Backend Eligibility Engine Tests:** 12 automated unit tests verified and passing via Python unittest (`backend/tests/test_runner.py`).
- **Deterministic Guarantees:**
  - PM-KISAN, PMAY-G, NSP Scholarship, IGNOAPS, YSR Rythu Bharosa, Amma Vodi, PM-JAY verified against income limits, farmer status, and state boundaries.
  - Verification statuses explicitly classified as `OFFICIALLY_SOURCED`, `VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`, or `CONFLICTING`.
- **Frontend Pages:** 19 interactive pages created with dark navy/black civic SaaS theme, glassmorphic cards, loading skeletons, error states, and responsive navigation.

---

## 5. Known Limitations & Local Setup Notes

1. **Supabase & Gemini Secrets:** Must be supplied in `.env` (backend) and `.env.local` (frontend). Sample templates provided in `.env.example`.
2. **OCR / PyMuPDF:** PDF extraction uses native PyMuPDF (`fitz`). For scanned image OCR, `tesseract` binary can be installed locally if offline image OCR is desired; multimodal Gemini Vision API provides cloud fallback.
3. **Web Speech API:** Browser voice input and synthesis requires Chrome / Edge / modern browsers supporting `webkitSpeechRecognition` and `speechSynthesis`.
