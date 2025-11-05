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
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll } from "vitest";
import { DbConfig } from "../src/utilities/dbConfig.js";

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE = "postgres:14";

/**
 * Starts a PostgreSQL container for testing purposes.
 *
 * @param config - The configuration for the PostgreSQL container.
 * @returns A promise that resolves to the started test container.
 */
export const postgreSQLContainer = (config: DbConfig): GenericContainer =>
  new GenericContainer(TEST_POSTGRES_DB_IMAGE)
    .withEnvironment({
      POSTGRES_DB: config.dbName,
      POSTGRES_USER: config.dbUsername,
      POSTGRES_PASSWORD: config.dbPassword,
    })
    .withCopyFilesToContainer([
      {
        source: "../../docker/postgres/init-db.sql",
        target: "/docker-entrypoint-initdb.d/01-init.sql",
      },
    ])
    .withExposedPorts(TEST_POSTGRES_DB_PORT);

let startedPostgreSqlContainer: StartedTestContainer | undefined;

beforeAll(async () => {
  startedPostgreSqlContainer = await postgreSQLContainer({
    dbHost: config.dbHost,
    dbName: config.dbName,
    dbUsername: config.dbUsername,
    dbPassword: config.dbPassword,
    dbPort: config.dbPort,
    dbSchema: config.dbSchema,
    dbUseSSL: config.dbUseSSL,
  }).start();

  config.dbPort = startedPostgreSqlContainer.getMappedPort(5432);
});

afterAll(async () => {
  await startedPostgreSqlContainer?.stop();
});

export const addEserviceProbingRequest = async (
  data: EserviceProbingRequestSchema,
  repository: EserviceProbingRequestEntities,
): Promise<ObjectLiteral[]> => {
  const result = await repository.upsert(data, {
    skipUpdateIfNoValuesChanged: true,
    conflictPaths: ["eserviceRecordId"],
  });
  return result.identifiers;
};

export const addEserviceProbingResponse = async (
  data: EserviceProbingResponseSchema,
  repository: EserviceProbingResponseEntities,
): Promise<ObjectLiteral[]> => {
  const result = await repository.upsert(data, {
    skipUpdateIfNoValuesChanged: true,
    conflictPaths: ["eserviceRecordId"],
  });
  return result.identifiers;
};

export const addEservice = async (
  data: EserviceSchema,
  repository: EserviceEntities,
): Promise<number> => {
  const result: InsertResult = await repository
    .createQueryBuilder()
    .insert()
    .values({
      eserviceRecordId: () =>
        `nextval('"${config.dbSchema}"."eservice_sequence"'::regclass)`,
      ...data,
    })
    .returning("id")
    .execute();

  const [eservice]: { id: string }[] = result.raw;
  return Number(eservice.id);
};

export const addTenant = async (
  data: TenantSchema,
  repository: TenantEntities,
): Promise<TenantSchema> => {
  const result: InsertResult = await repository
    .createQueryBuilder()
    .insert()
    .values({
      tenantRecordId: () =>
        `nextval('"${config.dbSchema}"."tenant_sequence"'::regclass)`,
      ...data,
    })
    .returning("*")
    .execute();

  const [tenant]: TenantSchema[] = result.raw;
  return tenant;
};

export const getEservice = async (
  eserviceRecordId: number,
  repository: EserviceViewEntities,
): Promise<EserviceViewSchema | { [key: string]: string }> => {
  return (await repository.findOneBy({ eserviceRecordId })) || {};
};
