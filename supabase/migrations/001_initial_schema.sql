-- ============================================================
-- SchemeSaathi – Complete Database Schema
-- Run in Supabase SQL Editor (or via migration tool)
-- ============================================================

-- Enable pgvector for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    age INTEGER CHECK (age > 0 AND age < 150),
    gender TEXT CHECK (gender IN ('male','female','other')),
    state TEXT,
    district TEXT,
    annual_income NUMERIC(12,2) CHECK (annual_income >= 0),
    occupation TEXT,
    education TEXT,
    family_size INTEGER CHECK (family_size > 0),
    category TEXT CHECK (category IN ('SC','ST','OBC','General','EWS','Minority')),
    is_farmer BOOLEAN DEFAULT FALSE,
    is_student BOOLEAN DEFAULT FALSE,
    has_disability BOOLEAN DEFAULT FALSE,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en','te','hi')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access to profiles" ON profiles FOR ALL USING (true);

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL CHECK (relation IN ('father','mother','son','daughter','spouse','grandfather','grandmother','sibling','other')),
    age INTEGER NOT NULL CHECK (age >= 0 AND age < 150),
    gender TEXT NOT NULL CHECK (gender IN ('male','female','other')),
    occupation TEXT,
    education TEXT,
    annual_income NUMERIC(12,2) DEFAULT 0,
    is_farmer BOOLEAN DEFAULT FALSE,
    is_student BOOLEAN DEFAULT FALSE,
    has_disability BOOLEAN DEFAULT FALSE,
    category TEXT CHECK (category IN ('SC','ST','OBC','General','EWS','Minority')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_family_members_user_id ON family_members(user_id);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own family" ON family_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to family" ON family_members FOR ALL USING (true);

-- ============================================================
-- SCHEME DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS scheme_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    ministry TEXT,
    website TEXT,
    state TEXT DEFAULT 'Central',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHEMES (master dataset)
-- ============================================================
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_key TEXT NOT NULL UNIQUE,  -- e.g. 'pm-kisan'
    name TEXT NOT NULL,
    department_id UUID REFERENCES scheme_departments(id),
    description TEXT NOT NULL,
    eligibility_summary TEXT,
    benefits TEXT,
    income_limit NUMERIC(12,2),
    required_documents TEXT[],
    application_procedure TEXT,
    applicable_state TEXT DEFAULT 'All India',
    official_url TEXT,
    helpline TEXT,
    last_verified DATE,
    verification_status TEXT DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('OFFICIALLY_SOURCED','VERIFIED','PARTIALLY_VERIFIED','UNVERIFIED','CONFLICTING')),
    is_active BOOLEAN DEFAULT TRUE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    tags TEXT[],  -- ['agriculture','central','farmer']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schemes_key ON schemes(scheme_key);
CREATE INDEX idx_schemes_state ON schemes(applicable_state);
CREATE INDEX idx_schemes_tags ON schemes USING GIN(tags);

-- ============================================================
-- ELIGIBILITY RULES (supplementary to Python engine)
-- ============================================================
CREATE TABLE IF NOT EXISTS eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    rule_field TEXT NOT NULL,     -- 'age', 'income', 'state', etc.
    rule_operator TEXT NOT NULL,  -- 'gte', 'lte', 'eq', 'in', 'not_in'
    rule_value TEXT NOT NULL,
    rule_description TEXT,
    is_exclusion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RAG CHUNKS (vector embeddings for semantic search)
-- ============================================================
CREATE TABLE IF NOT EXISTS rag_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    embedding vector(768),
    source_name TEXT,
    source_url TEXT,
    document_type TEXT DEFAULT 'scheme',
    scheme_id TEXT,  -- references scheme_key or document_id
    chunk_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rag_chunks_scheme_id ON rag_chunks(scheme_id);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_rag_chunks(
    query_embedding vector(768),
    match_count INT DEFAULT 5,
    filter_scheme_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    source_name TEXT,
    source_url TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rc.id,
        rc.content,
        rc.source_name,
        rc.source_url,
        1 - (rc.embedding <=> query_embedding) AS similarity
    FROM rag_chunks rc
    WHERE
        (filter_scheme_id IS NULL OR rc.scheme_id = filter_scheme_id)
        AND rc.embedding IS NOT NULL
    ORDER BY rc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- AGENT CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_conversations_user ON agent_conversations(user_id, conversation_id);
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own conversations" ON agent_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access conversations" ON agent_conversations FOR ALL USING (true);

-- ============================================================
-- USER SCHEME JOURNEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_scheme_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scheme_key TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    current_stage TEXT NOT NULL DEFAULT 'SCHEME_DISCOVERED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journeys_user ON user_scheme_journeys(user_id);
ALTER TABLE user_scheme_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journeys" ON user_scheme_journeys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full journeys" ON user_scheme_journeys FOR ALL USING (true);

-- Journey stage history
CREATE TABLE IF NOT EXISTS journey_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL REFERENCES user_scheme_journeys(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    notes TEXT,
    user_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journey_stages_journey ON journey_stages(journey_id);

-- ============================================================
-- SCAM REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS scam_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    classification TEXT NOT NULL CHECK (classification IN ('VERIFIED','SUSPICIOUS','UNVERIFIED')),
    risk_level TEXT CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    evidence TEXT[],
    safety_recommendations TEXT[],
    explanation TEXT,
    url_analyzed TEXT,
    has_file BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scam_reports_user ON scam_reports(user_id);
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own scam reports" ON scam_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full scam" ON scam_reports FOR ALL USING (true);

-- ============================================================
-- DOCUMENT UPLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('simplifier','intelligence','other')),
    scheme_key TEXT,
    text_extracted TEXT,
    simplified_content TEXT,
    analysis_result TEXT,
    language TEXT DEFAULT 'en',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_uploads_user ON document_uploads(user_id);
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON document_uploads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full documents" ON document_uploads FOR ALL USING (true);

-- ============================================================
-- INFORMATION CONFLICTS
-- ============================================================
CREATE TABLE IF NOT EXISTS information_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_key TEXT NOT NULL,
    source_a_name TEXT NOT NULL,
    source_a_url TEXT,
    source_a_content TEXT,
    source_a_date TEXT,
    source_b_name TEXT NOT NULL,
    source_b_url TEXT,
    source_b_content TEXT,
    source_b_date TEXT,
    conflict_description TEXT NOT NULL,
    conflict_field TEXT NOT NULL,
    reported_by UUID REFERENCES profiles(id),
    verified BOOLEAN DEFAULT FALSE,
    admin_resolution TEXT,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conflicts_scheme ON information_conflicts(scheme_key);

-- ============================================================
-- SCHEME CHANGES (monitor)
-- ============================================================
CREATE TABLE IF NOT EXISTS scheme_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_key TEXT NOT NULL,
    change_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_description TEXT,
    source_url TEXT,
    verified_by UUID REFERENCES profiles(id),
    effective_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheme_changes_key ON scheme_changes(scheme_key);

-- ============================================================
-- CITIZEN REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('scheme_match','family_benefit','eligibility','custom')),
    title TEXT,
    content JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citizen_reports_user ON citizen_reports(user_id);
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own reports" ON citizen_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full reports" ON citizen_reports FOR ALL USING (true);

-- ============================================================
-- ADMIN LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
