import { EntitySchema } from "typeorm";
import {
  EserviceInteropState,
  EserviceTechnology,
} from "pagopa-interop-probing-models";
import { config } from "../../utilities/config.js";
import { nowDateUTC } from "../../utilities/date.js";

export interface EserviceSchema {
  eserviceRecordId?: number;
  basePath: string[];
  eserviceName: string;
  technology: EserviceTechnology;
  eserviceId: string;
  pollingFrequency?: number;
  pollingStartTime: string;
  pollingEndTime: string;
  probingEnabled: boolean;
  producerName: string;
  state: EserviceInteropState;
  versionId: string;
  lockVersion: number;
  versionNumber: number;
  audience: string[];
}
export interface TenantSchema {
  tenantRecordId?: number;
  tenantId: string;
  tenantName: string;
}

/**
 * SIMILAR ISSUE: https://github.com/typeorm/typeorm/issues/7098
 * -----------------------------------------------------
 * DESCRIPTION:
 * There is an issue where default values specified in entity schemas
 * are being ignored during the insertion of records using TypeORM.
 *
 * DETAILS:
 * When attempting to insert a record into the database using TypeORM, the expected
 * default values defined in the entity schema are not being applied as intended giving not null error.
 *
 * WORKAROUND:
 * Currently workaround is manually set default values during record insertion.
 *
 * EXAMPLE:
 * ```typescript
 * const data = {a: 1, b: 2}:
 * const newRecord = new YourEntity();
 * await entityManager.save({...eServiceDefaultValues, ..data});
 * ```
 *
 * Please refer to the GitHub issue for updates on the status of the bug and any
 * potential fixes or workarounds provided by the TypeORM community.
 *
 * INFO:
 * @property {string} pollingStartTime - Format: "00:00:00+00"
 * @property {string} pollingEndTime - Format: "23:59:00+00"
 * @property {number} pollingFrequency
 * @property {boolean} probingEnabled
 * @property {number} lockVersion
 */
export const eServiceDefaultValues = {
  pollingStartTime: nowDateUTC(0, 0, 0),
  pollingEndTime: nowDateUTC(23, 59, 0),
  pollingFrequency: 5,
  probingEnabled: true,
  lockVersion: 1,
} as const;

/**
 * EserviceSchema
 * @remarks
 * - `eserviceRecordId`: serves as the primary key and is generated manually
 * using the nextval function of PostgreSQL during insert queries addressing an
 * issue in TypeORM for column awareness of the sequence: https://github.com/typeorm/typeorm/issues/5283
 *
 * @example
 * // Example usage to insert a new record with manually generated eserviceRecordId:
 * await Eservice
 *   .createQueryBuilder()
 *   .insert()
 *   .values({
 *     eserviceRecordId: () =>
 *       `nextval('"${config.schemaName}"."eservice_sequence"'::regclass)`,
 *     // ... (other values for other columns)
 *   })
 *   .execute();
 */
export const Eservice = new EntitySchema<EserviceSchema>({
  name: `${config.schemaName}.eservices`,
  columns: {
    eserviceRecordId: {
      name: "id",
      type: "bigint",
      primary: true,
      nullable: false,
    },
    basePath: {
      name: "base_path",
      type: "varchar",
      array: true,
      length: 2048,
      nullable: false,
    },
    eserviceName: {
      name: "eservice_name",
      type: "varchar",
      length: 255,
      nullable: false,
    },
    technology: {
      name: "eservice_technology",
      type: "varchar",
      nullable: false,
    },
    eserviceId: {
      name: "eservice_id",
      type: "uuid",
      nullable: false,
    },
    pollingFrequency: {
      name: "polling_frequency",
      type: "int",
      nullable: false,
    },
    pollingStartTime: {
      name: "polling_start_time",
      type: "time with time zone",
      nullable: false,
    },
    pollingEndTime: {
      name: "polling_end_time",
      type: "time with time zone",
      nullable: false,
    },
    probingEnabled: {
      name: "probing_enabled",
      type: "boolean",
      nullable: false,
    },
    producerName: {
      name: "producer_name",
      type: "varchar",
      length: 255,
      nullable: false,
    },
    state: {
      name: "state",
      type: "varchar",
      nullable: false,
    },
    versionId: {
      name: "version_id",
      type: "uuid",
      nullable: false,
    },
    lockVersion: {
      name: "lock_version",
      type: "int",
      nullable: false,
    },
    versionNumber: {
      name: "version_number",
      type: "int",
      nullable: false,
    },
    audience: {
      name: "audience",
      type: "varchar",
      array: true,
      length: 2048,
      nullable: false,
    },
  },
});

export const Tenant = new EntitySchema<TenantSchema>({
  name: `${config.schemaName}.tenants`,
  columns: {
    tenantRecordId: {
      name: "id",
      type: "bigint",
      primary: true,
      nullable: false,
    },
    tenantId: {
      name: "tenant_id",
      type: "uuid",
      nullable: false,
    },
    tenantName: {
      name: "tenant_name",
      type: "varchar",
      length: 255,
      nullable: false,
    },
  },
});
