import {
  EserviceEntities,
  EserviceProbingRequestEntities,
  EserviceProbingResponseEntities,
  EserviceViewEntities,
  TenantEntities,
} from "../src/repositories/modelRepository.js";
import { InsertResult, ObjectLiteral } from "typeorm";
import {
  EserviceSchema,
  TenantSchema,
} from "../src/repositories/entity/eservice.entity.js";
import { EserviceProbingRequestSchema } from "../src/repositories/entity/eservice_probing_request.entity.js";
import { EserviceProbingResponseSchema } from "../src/repositories/entity/eservice_probing_response.entity.js";
import { config } from "../src/utilities/config.js";
import { EserviceViewSchema } from "../src/repositories/entity/view/eservice.entity.js";

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
): Promise<number> => {
  const result: InsertResult = await repository
    .createQueryBuilder()
    .insert()
    .values({
      eserviceRecordId: () =>
        `nextval('"${config.schemaName}"."eservice_sequence"'::regclass)`,
      ...data,
    })
    .returning("id")
    .execute();

  const [eservice]: { id: string }[] = result.raw;
  return Number(eservice.id);
};

export const addTenant = async (
  data: TenantSchema,
  repository: TenantEntities
): Promise<TenantSchema> => {
  const result: InsertResult = await repository
    .createQueryBuilder()
    .insert()
    .values({
      tenantRecordId: () =>
        `nextval('"${config.schemaName}"."tenant_sequence"'::regclass)`,
      ...data,
    })
    .returning("*")
    .execute();

  const [tenant]: TenantSchema[] = result.raw;
  return tenant;
};

export const getEservice = async (
  eserviceRecordId: number,
  repository: EserviceViewEntities
): Promise<EserviceViewSchema | { [key: string]: string }> => {
  return (await repository.findOneBy({ eserviceRecordId })) || {};
};
