import { EntitySchema } from "typeorm";
import { EserviceStatus } from "pagopa-interop-probing-models";
import { EserviceSchema, Eservice } from "./eservice.entity.js";

export interface EserviceProbingResponseSchema {
  eserviceRecordId: number;
  responseReceived: string;
  responseStatus: EserviceStatus;
  eservice?: EserviceSchema;
}

export const EserviceProbingResponse =
  new EntitySchema<EserviceProbingResponseSchema>({
    name: `${process.env.SCHEMA_NAME}.eservice_probing_responses`,
    columns: {
      eserviceRecordId: {
        name: "eservices_record_id",
        type: "bigint",
        primary: true,
        nullable: false,
      },
      responseReceived: {
        name: "response_received",
        type: "timestamptz",
        nullable: false,
      },

      responseStatus: {
        name: "status",
        type: "enum",
        enum: EserviceStatus,
        nullable: false,
      },
    },
    relations: {
      eservice: {
        type: "one-to-one",
        target: Eservice,
        lazy: true,
        primary: true,
        joinColumn: {
          name: "eservices_record_id",
          referencedColumnName: "eserviceRecordId",
        },
      },
    },
  });
