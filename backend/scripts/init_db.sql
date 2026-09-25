-- Enable pgvector and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum types
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'uploading',
        'processing',
        'needs_review',
        'safe',
        'attention_soon',
        'expired',
        'error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM (
        'personal',
        'vehicle',
        'home',
        'work',
        'education',
        'finance',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type_enum AS ENUM (
        'national_id',
        'vehicle_license',
        'vehicle_insurance',
        'rental_contract',
        'utility_bill',
        'certificate',
        'work_contract',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_type_enum AS ENUM (
        'expiration',
        'due_date',
        'renewal',
        'contract_end',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(255),
    locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    document_type document_type_enum NOT NULL DEFAULT 'other',
    category document_category NOT NULL DEFAULT 'other',
    file_path VARCHAR(1024) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    status document_status NOT NULL DEFAULT 'processing',
    confidence_score FLOAT DEFAULT 0.0,
    raw_ocr_text TEXT,
    normalized_text TEXT,
    ai_summary TEXT,
    user_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    issue_date DATE,
    expiry_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Document fields table
CREATE TABLE IF NOT EXISTS document_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    is_user_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fields_doc ON document_fields(document_id);

-- Document chunks table with pgvector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    page_number INT DEFAULT 1,
    chunk_index INT NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_user ON document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_type reminder_type_enum NOT NULL DEFAULT 'expiration',
    target_date DATE NOT NULL,
    days_before INT NOT NULL DEFAULT 30,
    reminder_date DATE NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_dismissed ON reminders(is_dismissed);

-- Processing jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    step VARCHAR(100) NOT NULL DEFAULT 'queued',
    progress_percentage INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_doc ON processing_jobs(document_id);
