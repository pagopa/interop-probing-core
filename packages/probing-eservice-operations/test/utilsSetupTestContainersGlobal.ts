import "dotenv-flow/config";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import type { TestProject } from "vitest/node";
import { DbConfig } from "../src/utilities/dbConfig.js";

declare module "vitest" {
  export interface ProvidedContext {
    dbConfig: DbConfig;
  }
}

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE = "postgres:14";

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

export default async function setupTestContainersVitestGlobal({
  provide,
}: TestProject) {
  const dbConfig = DbConfig.safeParse(process.env);
  let startedPostgreSqlContainer: StartedTestContainer | undefined;

  if (dbConfig.success) {
    startedPostgreSqlContainer = await postgreSQLContainer(
      dbConfig.data,
    ).start();

    dbConfig.data.dbPort = startedPostgreSqlContainer.getMappedPort(
      TEST_POSTGRES_DB_PORT,
    );

    provide("dbConfig", dbConfig.data);
  }

  return async () => {
    await startedPostgreSqlContainer?.stop();
  };
}
