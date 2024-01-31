import {
  EserviceEntities,
  EserviceProbingRequestEntities,
  EserviceProbingResponseEntities,
} from "../src/repositories/modelRepository.js";
import { ObjectLiteral } from "typeorm";
import { EserviceSchema } from "../src/repositories/entity/eservice.entity.js";
import { EserviceProbingRequestSchema } from "../src/repositories/entity/eservice_probing_request.entity.js";
import { EserviceProbingResponseSchema } from "../src/repositories/entity/eservice_probing_response.entity.js";
import { config } from "../src/utilities/config.js";

export const addEserviceProbingRequest = async (
  data: EserviceProbingRequestSchema,
  repository: EserviceProbingRequestEntities
): Promise<ObjectLiteral[]> => {
  const result = await repository.upsert(data, {
    skipUpdateIfNoValuesChanged: true,
    conflictPaths: ["eserviceRecordId"],
  });
  return result.identifiers;
};

export const addEserviceProbingResponse = async (
  data: EserviceProbingResponseSchema,
  repository: EserviceProbingResponseEntities
): Promise<ObjectLiteral[]> => {
  const result = await repository.upsert(data, {
    skipUpdateIfNoValuesChanged: true,
    conflictPaths: ["eserviceRecordId"],
  });
  return result.identifiers;
};

export const addEservice = async (
  data: EserviceSchema,
  repository: EserviceEntities
): Promise<{ id: string }> => {
  const results = await repository
    .createQueryBuilder()
    .insert()
    .values({
      eserviceRecordId: () =>
        `nextval('"${config.schemaName}"."eservice_sequence"'::regclass)`,
      ...data,
    })
    .returning("id")
    .execute();

  const [result] = results.raw;
  return result;
};
