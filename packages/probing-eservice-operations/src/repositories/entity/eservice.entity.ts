import { EntitySchema } from "typeorm";
import {
  EserviceInteropState,
  EserviceTechnology,
} from "pagopa-interop-probing-models";

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

export const Eservice = new EntitySchema<EserviceSchema>({
  name: `${process.env.SCHEMA_NAME}.eservices`,
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
      default: 5,
      nullable: false,
    },
    pollingStartTime: {
      name: "polling_start_time",
      type: "time with time zone",
      default: "00:00:00+00",
      nullable: false,
    },
    pollingEndTime: {
      name: "polling_end_time",
      type: "time with time zone",
      default: "23:59:00+00",
      nullable: false,
    },
    probingEnabled: {
      name: "probing_enabled",
      type: "boolean",
      default: true,
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
