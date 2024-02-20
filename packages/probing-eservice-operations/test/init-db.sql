CREATE SCHEMA IF NOT EXISTS probing;

CREATE SEQUENCE IF NOT EXISTS probing.eservice_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE probing.eservices (
   id BIGINT NOT NULL,
   base_path VARCHAR(2048) array NOT NULL,
   eservice_name VARCHAR(255) NOT NULL,
   eservice_technology VARCHAR(255) NOT NULL,
   eservice_id UUID NOT NULL,
   polling_end_time time WITH TIME ZONE NOT NULL,
   polling_frequency INTEGER DEFAULT 5 NOT NULL,
   polling_start_time time WITH TIME ZONE NOT NULL,
   probing_enabled BOOLEAN NOT NULL,
   producer_name VARCHAR(2048) NOT NULL,
   state VARCHAR(255) NOT NULL, 
   version_id UUID NOT NULL,
   lock_version INTEGER NOT NULL,
   version_number INTEGER NOT NULL,
   audience VARCHAR(2048) array NOT NULL,
   CONSTRAINT pk_eservices PRIMARY KEY (id)
);

ALTER TABLE probing.eservices ADD CONSTRAINT UQ_eservices_eservice_id_version_id UNIQUE (eservice_id, version_id);

CREATE TABLE probing.eservice_probing_responses (
    response_received timestamptz NOT NULL,
    status VARCHAR(2) NOT NULL,
    eservices_record_id int8 NOT NULL,
    CONSTRAINT eservice_probing_responses_pkey PRIMARY KEY (eservices_record_id)
);

ALTER TABLE probing.eservice_probing_responses ADD CONSTRAINT FK_ESERVICE_ESERVICE_PROBING_RESPONSE FOREIGN KEY (eservices_record_id) REFERENCES probing.eservices(id);

CREATE TABLE probing.eservice_probing_requests (
    last_request timestamptz NOT NULL,
    eservices_record_id int8 NOT NULL,
    CONSTRAINT eservice_probing_requests_pkey PRIMARY KEY (eservices_record_id)
);

ALTER TABLE probing.eservice_probing_requests ADD CONSTRAINT FK_ESERVICE_ESERVICE_PROBING_REQUESTS FOREIGN KEY (eservices_record_id) REFERENCES probing.eservices(id);

CREATE VIEW probing.eservice_view AS
SELECT e.id, e.eservice_id , e.eservice_name, e.producer_name , e.version_id , e.state , epr.status ,e.probing_enabled , e.version_number , epr.response_received , epreq.last_request, e.polling_frequency, e.polling_start_time, e.polling_end_time, e.base_path, e.eservice_technology, e.audience
FROM probing.eservices e
LEFT JOIN probing.eservice_probing_responses epr ON epr.eservices_record_id = e.id
LEFT JOIN probing.eservice_probing_requests epreq on epreq.eservices_record_id=e.id;

CREATE ROLE "probinguser" WITH 
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOINHERIT
    LOGIN
    NOREPLICATION
    NOBYPASSRLS
    CONNECTION LIMIT -1
    PASSWORD 'mypassword';

GRANT CREATE, USAGE ON SCHEMA probing TO "probinguser";
GRANT SELECT, INSERT, UPDATE ON TABLE probing.eservice_probing_requests TO "probinguser";
GRANT SELECT, INSERT, UPDATE ON TABLE probing.eservice_probing_responses TO "probinguser";
GRANT SELECT, INSERT, UPDATE ON TABLE probing.eservices TO "probinguser";
GRANT SELECT ON TABLE probing.eservice_view TO "probinguser";
GRANT SELECT, USAGE ON SEQUENCE probing.eservice_sequence TO "probinguser";