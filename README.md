# Life Administration OS (MVP)

> **"Your documents shouldn't just be stored. They should understand you."**

An AI-powered personal document management system designed for users in Egypt, built with privacy-first architecture, bilingual English/Arabic RTL support, proactive date tracking, and a strictly grounded AI document assistant.

---

## 🌟 Features

- **7 Core Document Categories + Other**:
  - Egyptian National ID (`national_id`)
  - Vehicle License (`vehicle_license`)
  - Vehicle Insurance (`vehicle_insurance`)
  - Rental Contract (`rental_contract`)
  - Utility Bill (`utility_bill`)
  - Certificate (`certificate`)
  - Work Contract (`work_contract`)
  - Other Document (`other`)
- **End-to-End AI Pipeline**:
  - OCR with Arabic & English character normalization (Alef, Taa Marbuta, Eastern Arabic digits).
  - Document auto-classification with confidence scoring.
  - Field extraction & date detection (issue, expiry, due dates).
  - Human Verification loop for user correction & confirmation.
- **Proactive Reminders**:
  - Automatically schedules 30-day, 7-day, and 1-day reminders before expiration or due dates.
- **Grounded AI Document Assistant**:
  - Vector similarity search (`sentence-transformers` 384-dim dense vectors).
  - Anti-hallucination constraint with verified source citations.
- **Bilingual Interface**:
  - English and Arabic (`العربية`) with instantaneous RTL layout (`dir="rtl"`) and Arabic typography (`Noto Sans Arabic` / `Cairo`).
- **Privacy & Multi-Tenant Isolation**:
  - Every document query requires verified JWT authentication; zero cross-tenant access.

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
# Activate venv:
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- API Documentation: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Web App: `http://127.0.0.1:5173/`

### 3. Docker PostgreSQL + pgvector (Optional)

```bash
docker compose up -d
```
*(If Docker is not running, the backend automatically uses an SQLite fallback database with zero setup).*

### 4. Running Backend Tests

```bash
cd backend
.venv\Scripts\pytest.exe -v
```

---

## 📁 Repository Structure

```text
Life-Administration-OS/
├── docker-compose.yml              # PostgreSQL with pgvector service
├── backend/
│   ├── app/
│   │   ├── api/                    # Auth, Documents, Reminders, Assistant, Search, Dashboard
│   │   ├── services/               # OCR, Classifier, Extractor, Embeddings, LLM, Reminders, Pipeline
│   │   ├── models/                 # SQLAlchemy models (Document, Field, Chunk, Reminder, Job)
│   │   ├── schemas/                # Pydantic v2 schemas
│   │   ├── demo/                   # Realistic Egyptian demo dataset generator
│   │   ├── config.py               # Pydantic Settings
│   │   ├── database.py             # SQLAlchemy Async Engine with fallback
│   │   └── main.py                 # FastAPI application
│   ├── scripts/                    # PostgreSQL init_db.sql with pgvector
│   ├── tests/                      # Pytest unit & integration tests
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/             # Navbar, DocumentCard, UploadModal, HumanVerificationModal, etc.
    │   ├── context/                # LanguageContext (EN/AR RTL), AuthContext
    │   ├── pages/                  # Landing, Login, SignUp, Dashboard, Documents, Detail, Reminders, Assistant
    │   ├── services/               # API client
    │   └── types/                  # TypeScript types
    ├── package.json
    └── tailwind.config.js
```