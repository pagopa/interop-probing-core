import {
  pgSchema,
  unique,
  bigserial,
  uuid,
  varchar,
  integer,
  boolean,
  time,
  foreignKey,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const probing = pgSchema("probing");

export const eserviceSequenceInProbing = probing.sequence("eservice_sequence", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const tenantSequenceInProbing = probing.sequence("tenant_sequence", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});

export const tenantsInProbing = probing.table(
  "tenants",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    tenantId: uuid("tenant_id").notNull(),
    tenantName: varchar("tenant_name", { length: 2048 }),
  },
  (table) => [unique("tenants_tenant_id_key").on(table.tenantId)],
);

export const eservicesInProbing = probing.table(
  "eservices",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    eserviceId: uuid("eservice_id").notNull(),
    versionId: uuid("version_id").notNull(),
    eserviceName: varchar("eservice_name", { length: 255 }).notNull(),
    producerName: varchar("producer_name", { length: 2048 }).notNull(),
    eserviceTechnology: varchar("eservice_technology", {
      length: 255,
    }).notNull(),
    basePath: varchar("base_path", { length: 2048 }).array().notNull(),
    audience: varchar({ length: 2048 }).array().notNull(),
    state: varchar({ length: 255 }).notNull(),
    versionNumber: integer("version_number").notNull(),
    lockVersion: integer("lock_version").notNull(),
    probingEnabled: boolean("probing_enabled").notNull(),
    pollingStartTime: time("polling_start_time", {
      withTimezone: true,
    }).notNull(),
    pollingEndTime: time("polling_end_time", { withTimezone: true }).notNull(),
    pollingFrequency: integer("polling_frequency").default(5).notNull(),
  },
  (table) => [
    unique("eservices_eservice_version_unique").on(
      table.eserviceId,
      table.versionId,
    ),
  ],
);

export const eserviceProbingRequestsInProbing = probing.table(
  "eservice_probing_requests",
  {
    eservicesRecordId: bigint("eservices_record_id", { mode: "number" })
      .primaryKey()
      .notNull(),
    lastRequest: timestamp("last_request", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eservicesRecordId],
      foreignColumns: [eservicesInProbing.id],
      name: "eservice_probing_requests_eservices_record_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const eserviceProbingResponsesInProbing = probing.table(
  "eservice_probing_responses",
  {
    eservicesRecordId: bigint("eservices_record_id", { mode: "number" })
      .primaryKey()
      .notNull(),
    responseReceived: timestamp("response_received", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    status: varchar({ length: 2 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eservicesRecordId],
      foreignColumns: [eservicesInProbing.id],
      name: "eservice_probing_responses_eservices_record_id_fkey",
    }).onDelete("cascade"),
  ],
);
export const eserviceViewInProbing = probing
  .view("eservice_view", {
    id: bigint({ mode: "number" }),
    eserviceId: uuid("eservice_id"),
    eserviceName: varchar("eservice_name", { length: 255 }),
    producerName: varchar("producer_name", { length: 2048 }),
    versionId: uuid("version_id"),
    state: varchar({ length: 255 }),
    status: varchar({ length: 2 }),
    probingEnabled: boolean("probing_enabled"),
    versionNumber: integer("version_number"),
    responseReceived: timestamp("response_received", {
      withTimezone: true,
      mode: "string",
    }),
    lastRequest: timestamp("last_request", {
      withTimezone: true,
      mode: "string",
    }),
    pollingFrequency: integer("polling_frequency"),
    pollingStartTime: time("polling_start_time", { withTimezone: true }),
    pollingEndTime: time("polling_end_time", { withTimezone: true }),
    basePath: varchar("base_path", { length: 2048 }),
    eserviceTechnology: varchar("eservice_technology", { length: 255 }),
    audience: varchar({ length: 2048 }),
  })
  .as(
    sql`SELECT e.id, e.eservice_id, e.eservice_name, e.producer_name, e.version_id, e.state, epr.status, e.probing_enabled, e.version_number, epr.response_received, epreq.last_request, e.polling_frequency, e.polling_start_time, e.polling_end_time, e.base_path, e.eservice_technology, e.audience FROM probing.eservices e LEFT JOIN probing.eservice_probing_responses epr ON epr.eservices_record_id = e.id LEFT JOIN probing.eservice_probing_requests epreq ON epreq.eservices_record_id = e.id`,
  );
