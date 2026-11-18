-- IntelliDLP PostgreSQL 18 Relational Schema Initialization
-- Version: 1.0.0

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(32) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Roles Junction
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Endpoints
CREATE TABLE IF NOT EXISTS endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostname VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64),
    mac_address VARCHAR(64),
    os_version VARCHAR(128),
    agent_version VARCHAR(32),
    status VARCHAR(24) NOT NULL DEFAULT 'ONLINE',
    last_seen TIMESTAMP WITH TIME ZONE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Monitored Directories
CREATE TABLE IF NOT EXISTS monitored_directories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    directory_path VARCHAR(1024) NOT NULL,
    recursive BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Endpoint Heartbeats
CREATE TABLE IF NOT EXISTS endpoint_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    heartbeat_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status_payload VARCHAR(2048)
);

-- 7. Scanned Files
CREATE TABLE IF NOT EXISTS scanned_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_type VARCHAR(64),
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    classification_level VARCHAR(32) NOT NULL DEFAULT 'PUBLIC',
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Data Findings
CREATE TABLE IF NOT EXISTS data_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scanned_file_id UUID NOT NULL REFERENCES scanned_files(id) ON DELETE CASCADE,
    finding_type VARCHAR(64) NOT NULL,
    masked_value VARCHAR(255) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    match_count INT NOT NULL DEFAULT 1,
    start_offset INT,
    end_offset INT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Classification Rules
CREATE TABLE IF NOT EXISTS classification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    classification_level VARCHAR(32) NOT NULL,
    condition_json VARCHAR(2048),
    priority INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. DLP Policies
CREATE TABLE IF NOT EXISTS dlp_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description VARCHAR(512),
    target_classification VARCHAR(32),
    detection_category VARCHAR(64),
    action VARCHAR(32) NOT NULL DEFAULT 'WARN',
    simulation_mode BOOLEAN NOT NULL DEFAULT TRUE,
    severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Policy Decisions
CREATE TABLE IF NOT EXISTS policy_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES dlp_policies(id) ON DELETE SET NULL,
    scanned_file_id UUID NOT NULL REFERENCES scanned_files(id) ON DELETE CASCADE,
    decision_applied VARCHAR(32) NOT NULL,
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    explanation VARCHAR(1024),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_code VARCHAR(32) NOT NULL UNIQUE,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    scanned_file_id UUID NOT NULL REFERENCES scanned_files(id) ON DELETE CASCADE,
    policy_decision_id UUID REFERENCES policy_decisions(id) ON DELETE SET NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    risk_score INT NOT NULL DEFAULT 0,
    risk_breakdown VARCHAR(2048),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Incident Notes
CREATE TABLE IF NOT EXISTS incident_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_text VARCHAR(4096) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    target_resource VARCHAR(255),
    client_ip VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    details VARCHAR(2048),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    title VARCHAR(128) NOT NULL,
    message VARCHAR(1024) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Redaction Records
CREATE TABLE IF NOT EXISTS redaction_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_file_id UUID NOT NULL REFERENCES scanned_files(id) ON DELETE CASCADE,
    redacted_file_path VARCHAR(1024) NOT NULL,
    redacted_count INT NOT NULL DEFAULT 0,
    redacted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_endpoints_hostname ON endpoints(hostname);
CREATE INDEX IF NOT EXISTS idx_scanned_files_sha256 ON scanned_files(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_data_findings_type ON data_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_incidents_code ON incidents(incident_code);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Initial Roles Seeding
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'Full system administration and policy management'),
    ('ROLE_ANALYST', 'Incident investigation, review evidence and notes'),
    ('ROLE_USER', 'Standard endpoint user')
ON CONFLICT (name) DO NOTHING;

