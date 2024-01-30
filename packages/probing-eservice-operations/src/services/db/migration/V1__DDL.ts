import { MigrationInterface, QueryRunner } from "typeorm";

export class V1_DDL_1706531694434 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Schema
    await queryRunner.query(
      `CREATE SCHEMA IF NOT EXISTS ${process.env.SCHEMA_NAME}`
    );

    // Create Sequence
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS ${process.env.SCHEMA_NAME}.eservice_sequence START WITH 1 INCREMENT BY 1`
    );

    // Create eservices Table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS ${process.env.SCHEMA_NAME}.eservices (
                id BIGINT NOT NULL,
                base_path VARCHAR(2048) ARRAY NOT NULL,
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
                audience VARCHAR(2048) ARRAY NOT NULL,
                CONSTRAINT pk_eservices PRIMARY KEY (id)
            )
        `);

    // Create Unique Constraint
    await queryRunner.query(`
            ALTER TABLE ${process.env.SCHEMA_NAME}.eservices
            ADD CONSTRAINT UQ_eservices_eservice_id_version_id
            UNIQUE (eservice_id, version_id)
        `);

    // Create eservice_probing_responses Table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS ${process.env.SCHEMA_NAME}.eservice_probing_responses (
                response_received timestamptz NOT NULL,
                status VARCHAR(2) NOT NULL,
                eservices_record_id int8 NOT NULL,
                CONSTRAINT eservice_probing_responses_pkey PRIMARY KEY (eservices_record_id),
                FOREIGN KEY (eservices_record_id) REFERENCES ${process.env.SCHEMA_NAME}.eservices(id)
            )
        `);

    // Create eservice_probing_requests Table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS ${process.env.SCHEMA_NAME}.eservice_probing_requests (
                last_request timestamptz NOT NULL,
                eservices_record_id int8 NOT NULL,
                CONSTRAINT eservice_probing_requests_pkey PRIMARY KEY (eservices_record_id),
                FOREIGN KEY (eservices_record_id) REFERENCES ${process.env.SCHEMA_NAME}.eservices(id)
            )
        `);

    // Create eservice_view
    await queryRunner.query(`
            CREATE VIEW ${process.env.SCHEMA_NAME}.eservice_view AS
            SELECT e.id, e.eservice_id, e.eservice_name, e.producer_name, e.version_id, e.state,
            epr.status, e.probing_enabled, e.version_number, epr.response_received, epreq.last_request,
            e.polling_frequency, e.polling_start_time, e.polling_end_time, e.base_path, e.eservice_technology, e.audience
            FROM ${process.env.SCHEMA_NAME}.eservices e
            LEFT JOIN ${process.env.SCHEMA_NAME}.eservice_probing_responses epr ON epr.eservices_record_id = e.id
            LEFT JOIN ${process.env.SCHEMA_NAME}.eservice_probing_requests epreq ON epreq.eservices_record_id = e.id
        `);

    // Create Role
    await queryRunner.query(`
            CREATE ROLE "${process.env.DATABASE_USERNAME}" WITH
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            LOGIN
            NOREPLICATION
            NOBYPASSRLS
            CONNECTION LIMIT -1
            PASSWORD '${process.env.DATABASE_PASSWORD}'
        `);

    // Grants
    await queryRunner.query(
      `GRANT CREATE, USAGE ON SCHEMA ${process.env.SCHEMA_NAME} TO "${process.env.DATABASE_USERNAME}"`
    );
    await queryRunner.query(
      `GRANT SELECT, INSERT, UPDATE ON TABLE ${process.env.SCHEMA_NAME}.eservice_probing_requests TO "${process.env.DATABASE_USERNAME}"`
    );
    await queryRunner.query(
      `GRANT SELECT, INSERT, UPDATE ON TABLE ${process.env.SCHEMA_NAME}.eservice_probing_responses TO "${process.env.DATABASE_USERNAME}"`
    );
    await queryRunner.query(
      `GRANT SELECT, INSERT, UPDATE ON TABLE ${process.env.SCHEMA_NAME}.eservices TO "${process.env.DATABASE_USERNAME}"`
    );
    await queryRunner.query(
      `GRANT SELECT ON TABLE ${process.env.SCHEMA_NAME}.eservice_view TO "${process.env.DATABASE_USERNAME}"`
    );
    await queryRunner.query(
      `GRANT SELECT, USAGE ON SEQUENCE ${process.env.SCHEMA_NAME}.eservice_sequence TO "${process.env.DATABASE_USERNAME}"`
    );
  }

  public async down(): Promise<void> {}
}
