import { EntitySchema } from "typeorm";
import {
  EserviceInteropState,
  EserviceTechnology,
  EserviceStatus,
} from "pagopa-interop-probing-models";
import { config } from "../../../utilities/config.js";

export interface EserviceViewSchema {
  eserviceRecordId: number;
  eserviceName: string;
  eserviceId: string;
  producerName: string;
  probingEnabled: boolean;
  state: EserviceInteropState;
  versionId: string;
  versionNumber: number;
  responseReceived?: string;
  lastRequest?: string;
  pollingFrequency: number;
  pollingStartTime: string;
  pollingEndTime: string;
  technology: EserviceTechnology;
  basePath: string[];
  responseStatus?: EserviceStatus;
  audience: string[];
}

export const EserviceView: EntitySchema<EserviceViewSchema> = new EntitySchema({
  name: `${config.dbSchema}.eservice_view`,
  columns: {
    eserviceRecordId: {
      name: "id",
      type: "bigint",
      primary: true,
    },
    eserviceName: {
      name: "eservice_name",
      type: "varchar",
    },
    eserviceId: {
      name: "eservice_id",
      type: "varchar",
    },
    producerName: {
      name: "producer_name",
      type: "varchar",
    },
    probingEnabled: {
      name: "probing_enabled",
      type: "boolean",
    },
    state: {
      name: "state",
      type: "enum",
      enum: EserviceInteropState,
    },
    versionId: {
      name: "version_id",
      type: "varchar",
    },
    versionNumber: {
      name: "version_number",
      type: "int",
    },
    responseReceived: {
      name: "response_received",
      type: "timestamptz",
    },
    lastRequest: {
      name: "last_request",
      type: "timestamptz",
    },
    pollingFrequency: {
      name: "polling_frequency",
      type: "int",
    },
    pollingStartTime: {
      name: "polling_start_time",
      type: "time with time zone",
    },
    pollingEndTime: {
      name: "polling_end_time",
      type: "time with time zone",
    },
    technology: {
      name: "eservice_technology",
      type: "enum",
      enum: EserviceTechnology,
    },
    basePath: {
      name: "base_path",
      type: "varchar",
      array: true,
      length: 2048,
    },
    responseStatus: {
      name: "status",
      type: "enum",
      enum: EserviceStatus,
    },
    audience: {
      name: "audience",
      type: "varchar",
      array: true,
      length: 2048,
    },
  },
  expression: `
  SELECT
    e.id AS eserviceRecordId,
    e.eservice_name AS eserviceName,
    e.eservice_id AS eserviceId,
    e.producer_name AS producerName,
    e.probing_enabled AS probingEnabled,
    e.state,
    e.version_id AS versionId,
    e.version_number AS versionNumber,
    epr.response_received AS responseReceived,
    epreq.last_request AS lastRequest,
    e.polling_frequency AS pollingFrequency,
    e.polling_start_time AS pollingStartTime,
    e.polling_end_time AS pollingEndTime,
    e.eservice_technology AS technology,
    e.base_path AS basePath,
    epr.status AS responseStatus,
    e.audience
  FROM
  ${config.dbSchema}.eservices e
  LEFT JOIN
  ${config.dbSchema}.eservice_probing_responses epr ON epr.eservices_record_id = e.id
  LEFT JOIN
  ${config.dbSchema}.eservice_probing_requests epreq ON epreq.eservices_record_id = e.id
  WHERE
    epr.response_received IS NOT NULL OR epreq.last_request IS NOT NULL
`,
});
