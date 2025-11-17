import { config as dotenv } from "dotenv-flow";
import { InfluxDBConfig } from "pagopa-interop-probing-commons";
import { StartedTestContainer } from "testcontainers";
import type {} from "vitest";
import type { TestProject } from "vitest/node";
import { influxDBContainer, TEST_INFLUX_PORT } from "./containerTestUtils.js";

declare module "vitest" {
  export interface ProvidedContext {
    influxDBConfig?: InfluxDBConfig;
  }
}

/**
 * This function is a global setup for vitest that starts and stops test containers.
 * It must be called in a file that is used as a global setup in the vitest configuration.
 *
 * It provides the `config` object to the tests, via the `provide` function.
 *
 * @see https://vitest.dev/config/#globalsetup).
 */
export function setupTestContainersVitestGlobal() {
  dotenv();

  const influxDBConfig = InfluxDBConfig.safeParse(process.env);

  return async function ({
    provide,
  }: TestProject): Promise<() => Promise<void>> {
    let startedInfluxContainer: StartedTestContainer | undefined;

    if (influxDBConfig.success) {
      startedInfluxContainer = await influxDBContainer(
        influxDBConfig.data,
      ).start();

      const mappedHost = startedInfluxContainer.getHost();
      const mappedPort = startedInfluxContainer.getMappedPort(TEST_INFLUX_PORT);

      influxDBConfig.data.influxUrl = `http://${mappedHost}:${mappedPort}`;

      provide("influxDBConfig", influxDBConfig.data);
    }

    return async (): Promise<void> => {
      await startedInfluxContainer?.stop();
    };
  };
}
