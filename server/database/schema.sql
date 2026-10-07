-- AI TrustGuard Supabase PostgreSQL Schema
-- Version: 1.0.0

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI SYSTEMS
CREATE TABLE IF NOT EXISTS ai_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(100) DEFAULT 'gemini',
    model_name VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    endpoint_url TEXT,
    api_key_encrypted TEXT,
    system_type VARCHAR(100) DEFAULT 'customer_support',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI PROFILES
CREATE TABLE IF NOT EXISTS ai_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_system_id UUID NOT NULL UNIQUE REFERENCES ai_systems(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    data_sensitivity VARCHAR(50) NOT NULL,
    risk_tolerance VARCHAR(50) NOT NULL,
    security_priority INT DEFAULT 25,
    privacy_priority INT DEFAULT 25,
    reliability_priority INT DEFAULT 20,
    safety_priority INT DEFAULT 20,
    transparency_priority INT DEFAULT 10,
    user_type VARCHAR(100) DEFAULT 'general_public',
    allowed_data JSONB DEFAULT '[]'::jsonb,
    restricted_data JSONB DEFAULT '[]'::jsonb,
    ai_restrictions JSONB DEFAULT '[]'::jsonb,
    known_capabilities JSONB DEFAULT '[]'::jsonb,
    known_restrictions JSONB DEFAULT '[]'::jsonb,
    compliance_requirements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RISK PROFILES
CREATE TABLE IF NOT EXISTS risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    security_risk INT NOT NULL,
    privacy_risk INT NOT NULL,
    reliability_risk INT NOT NULL,
    safety_risk INT NOT NULL,
    transparency_risk INT NOT NULL,
    primary_risk VARCHAR(100) NOT NULL,
    secondary_risks JSONB DEFAULT '[]'::jsonb,
    recommended_test_categories JSONB DEFAULT '[]'::jsonb,
    risk_confidence INT NOT NULL DEFAULT 80,
    profile_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERSONALIZATION STRATEGIES
CREATE TABLE IF NOT EXISTS personalization_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    security_weight NUMERIC(4,2) DEFAULT 0.25,
    privacy_weight NUMERIC(4,2) DEFAULT 0.25,
    reliability_weight NUMERIC(4,2) DEFAULT 0.20,
    safety_weight NUMERIC(4,2) DEFAULT 0.20,
    transparency_weight NUMERIC(4,2) DEFAULT 0.10,
    priority_categories JSONB DEFAULT '[]'::jsonb,
    recommended_difficulty VARCHAR(50) DEFAULT 'medium',
    recommended_tests_count INT DEFAULT 10,
    reasoning JSONB DEFAULT '[]'::jsonb,
    confidence_score INT DEFAULT 85,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEST CASES (LIBRARY)
CREATE TABLE IF NOT EXISTS test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    reason TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_custom BOOLEAN DEFAULT false,
    ai_system_id UUID REFERENCES ai_systems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVALUATIONS
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    total_tests INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    failed_tests INT DEFAULT 0,
    warning_tests INT DEFAULT 0,
    trust_score NUMERIC(5,2) DEFAULT 0,
    security_score NUMERIC(5,2) DEFAULT 0,
    privacy_score NUMERIC(5,2) DEFAULT 0,
    reliability_score NUMERIC(5,2) DEFAULT 0,
    safety_score NUMERIC(5,2) DEFAULT 0,
    transparency_score NUMERIC(5,2) DEFAULT 0,
    duration_ms INT DEFAULT 0,
    personalization_strategy JSONB DEFAULT '{}'::jsonb,
    is_retest BOOLEAN DEFAULT false,
    baseline_evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TEST RESULTS
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    actual_response TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    result VARCHAR(50) NOT NULL, -- 'pass', 'fail', 'warning'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low', 'informational'
    evidence TEXT,
    explanation TEXT,
    why_selected TEXT,
    recommendation TEXT,
    detection_details JSONB DEFAULT '{}'::jsonb,
    latency_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VULNERABILITIES
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
    test_result_id UUID REFERENCES test_results(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    impact TEXT,
    recommendation TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'risk_accepted'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FIREWALL POLICIES
CREATE TABLE IF NOT EXISTS firewall_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_system_id UUID NOT NULL UNIQUE REFERENCES ai_systems(id) ON DELETE CASCADE,
    pii_action VARCHAR(50) DEFAULT 'redact', -- 'allow', 'warn', 'block', 'redact'
    prompt_injection_action VARCHAR(50) DEFAULT 'block',
    sensitive_data_action VARCHAR(50) DEFAULT 'block',
    secret_action VARCHAR(50) DEFAULT 'redact',
    unsafe_content_action VARCHAR(50) DEFAULT 'block',
    custom_rules JSONB DEFAULT '[]'::jsonb,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FIREWALL EVENTS
CREATE TABLE IF NOT EXISTS firewall_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    input_text TEXT,
    output_text TEXT,
    risk_score NUMERIC(5,2) DEFAULT 0,
    action VARCHAR(50) NOT NULL, -- 'allow', 'warn', 'block', 'redact'
    reason TEXT,
    detection_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TRUST MEMORY
CREATE TABLE IF NOT EXISTS trust_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    memory_type VARCHAR(100) NOT NULL,
    memory_key VARCHAR(100) NOT NULL,
    memory_value TEXT NOT NULL,
    confidence VARCHAR(50) DEFAULT 'high',
    source VARCHAR(100) DEFAULT 'evaluation',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. USER FEEDBACK
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
    feedback_type VARCHAR(100),
    rating INT,
    comment TEXT,
    prioritized_categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    executive_summary TEXT,
    report_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. SECURITY INCIDENTS (Dedicated Incident Center)
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    threat_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    direction VARCHAR(50) NOT NULL, -- 'inbound' (prompt) or 'outbound' (response)
    input_text TEXT,
    output_text TEXT,
    detection_reason TEXT NOT NULL,
    action_taken VARCHAR(50) NOT NULL, -- 'blocked', 'redacted', 'warned', 'allowed'
    trust_score_impact NUMERIC(5,2) DEFAULT 0,
    recommended_action TEXT,
    detection_details JSONB DEFAULT '{}'::jsonb,
    user_feedback VARCHAR(50), -- 'useful', 'not_useful', 'false_positive', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. MONITORING EVENTS (Continuous AI Interaction Telemetry)
CREATE TABLE IF NOT EXISTS monitoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    request_id VARCHAR(100) NOT NULL,
    prompt TEXT,
    response TEXT,
    request_risk_level VARCHAR(50) DEFAULT 'safe',
    response_risk_level VARCHAR(50) DEFAULT 'safe',
    detected_threats JSONB DEFAULT '[]'::jsonb,
    detected_pii JSONB DEFAULT '[]'::jsonb,
    detected_secrets JSONB DEFAULT '[]'::jsonb,
    prompt_injection_status VARCHAR(50) DEFAULT 'none',
    policy_decision VARCHAR(50) DEFAULT 'allow',
    redactions JSONB DEFAULT '[]'::jsonb,
    blocked BOOLEAN DEFAULT false,
    latency_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. TRUST SCORE HISTORY (Historical Dynamic Timeline)
CREATE TABLE IF NOT EXISTS trust_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    previous_score NUMERIC(5,2),
    change NUMERIC(5,2) DEFAULT 0,
    reason TEXT NOT NULL,
    event_type VARCHAR(100) DEFAULT 'evaluation', -- 'evaluation', 'incident', 'retest', 'remediation'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_ai_systems_user_id ON ai_systems(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_profiles_system_id ON ai_profiles(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_system_id ON risk_profiles(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_system_id ON evaluations(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_eval_id ON test_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_system_id ON vulnerabilities(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_firewall_events_system_id ON firewall_events(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_trust_memory_system_id ON trust_memory(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_system_id ON user_feedback(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_system_id ON security_incidents(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_system_id ON monitoring_events(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_trust_score_history_system_id ON trust_score_history(ai_system_id);
