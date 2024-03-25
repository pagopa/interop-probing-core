import { EntitySchema } from "typeorm";
import { EserviceSchema, Eservice } from "./eservice.entity.js";
import { config } from "../../utilities/config.js";

export interface EserviceProbingRequestSchema {
  eserviceRecordId: number;
  lastRequest: string;
  eservice?: EserviceSchema;
}

export const EserviceProbingRequest =
  new EntitySchema<EserviceProbingRequestSchema>({
    name: `${config.schemaName}.eservice_probing_requests`,
    columns: {
      eserviceRecordId: {
        name: "eservices_record_id",
        type: "bigint",
        primary: true,
      },
      lastRequest: {
        type: "timestamptz",
        name: "last_request",
        nullable: false,
      },
    },
    relations: {
      eservice: {
        type: "one-to-one",
        target: Eservice,
        lazy: true,
        joinColumn: {
          name: "eservices_record_id",
          referencedColumnName: "eserviceRecordId",
        },
      },
    },
  });
