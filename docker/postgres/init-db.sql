CREATE SCHEMA IF NOT EXISTS probing;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tables
CREATE TABLE IF NOT EXISTS probing.tenants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id UUID NOT NULL UNIQUE,
    tenant_name VARCHAR(2048)
);

CREATE TABLE IF NOT EXISTS probing.eservices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eservice_id UUID NOT NULL,
    version_id UUID NOT NULL,
    eservice_name VARCHAR(255) NOT NULL,
    producer_name VARCHAR(2048) NOT NULL,
    eservice_technology VARCHAR(255) NOT NULL,
    base_path VARCHAR(2048) [] NOT NULL,
    audience VARCHAR(2048) [] NOT NULL,
    state VARCHAR(255) NOT NULL,
    version_number INTEGER NOT NULL,
    lock_version INTEGER NOT NULL,
    probing_enabled BOOLEAN NOT NULL,
    polling_start_time TIME WITH TIME ZONE NOT NULL,
    polling_end_time TIME WITH TIME ZONE NOT NULL,
    polling_frequency INTEGER DEFAULT 5 NOT NULL,
    CONSTRAINT eservices_eservice_version_unique UNIQUE (eservice_id, version_id)
);

CREATE TABLE IF NOT EXISTS probing.eservice_probing_requests (
    eservices_record_id BIGINT PRIMARY KEY REFERENCES probing.eservices(id) ON DELETE CASCADE,
    last_request TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS probing.eservice_probing_responses (
    eservices_record_id BIGINT PRIMARY KEY REFERENCES probing.eservices(id) ON DELETE CASCADE,
    response_received TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(2) NOT NULL
);

-- Views
CREATE
OR REPLACE VIEW probing.eservice_view AS
SELECT
    e.id,
    e.eservice_id,
    e.eservice_name,
    e.producer_name,
    e.version_id,
    e.state,
    epr.status,
    e.probing_enabled,
    e.version_number,
    epr.response_received,
    epreq.last_request,
    e.polling_frequency,
    e.polling_start_time,
    e.polling_end_time,
    e.base_path,
    e.eservice_technology,
    e.audience
FROM
    probing.eservices e
    LEFT JOIN probing.eservice_probing_responses epr ON epr.eservices_record_id = e.id
    LEFT JOIN probing.eservice_probing_requests epreq ON epreq.eservices_record_id = e.id;

-- Indexes
CREATE INDEX IF NOT EXISTS eservices_producer_upper_trgm_idx ON probing.eservices USING GIN ((UPPER(producer_name)) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS eservices_name_upper_trgm_idx ON probing.eservices USING GIN ((UPPER(eservice_name)) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS eservices_state_idx ON probing.eservices (state);

CREATE INDEX IF NOT EXISTS eservices_polling_ready_idx ON probing.eservices (
    state,
    probing_enabled,
    polling_start_time,
    polling_end_time
)
WHERE
    state = 'ACTIVE'
    AND probing_enabled = true;

CREATE INDEX IF NOT EXISTS probing_requests_last_request_idx ON probing.eservice_probing_requests (last_request);

CREATE INDEX IF NOT EXISTS probing_responses_received_idx ON probing.eservice_probing_responses (response_received);