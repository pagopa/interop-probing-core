import { InfluxDBConfig } from "pagopa-interop-probing-commons";
import { GenericContainer } from "testcontainers";

export const TEST_INFLUX_PORT = 8086;
export const TEST_INFLUX_IMAGE = "influxdb:2.7";

/**
 * Starts an InfluxDB container for testing purposes.
 *
 * @param config - The configuration for the InfluxDB container.
 * @returns A promise that resolves to the started test container.
 */
export const influxDBContainer = (config: InfluxDBConfig): GenericContainer =>
  new GenericContainer(TEST_INFLUX_IMAGE)
    .withEnvironment({
      DOCKER_INFLUXDB_INIT_MODE: "setup",
      DOCKER_INFLUXDB_INIT_USERNAME: "root",
      DOCKER_INFLUXDB_INIT_PASSWORD: "root@root!",
      DOCKER_INFLUXDB_INIT_ORG: config.influxOrg,
      DOCKER_INFLUXDB_INIT_BUCKET: config.influxBucket,
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: config.influxToken,
    })
    .withExposedPorts(TEST_INFLUX_PORT);
