import {
  InfluxDBConfig,
  initTelemetryManager,
  TelemetryManager,
} from "pagopa-interop-probing-commons";

/**
 * Sets up a manager using the provided configuration and returns it together
 * with a cleanup function. The cleanup function should be called in `afterEach`
 * to ensure each test runs in an isolated state.
 *
 * @example
 * ```ts
 * import { setupTestContainersVitest } from "pagopa-interop-probing-commons-test";
 * import { inject, afterEach } from "vitest";
 *
 * export const { telemetryManager, cleanup } =
 *   await setupTestContainersVitest(inject("influxConfig"));
 *
 * afterEach(cleanup);
 * ```
 */
export function setupTestContainersVitest(
  influxConfig: InfluxDBConfig,
): Promise<{
  telemetryManager: TelemetryManager;
  cleanup: () => Promise<void>;
}>;

export async function setupTestContainersVitest(
  influxConfig?: InfluxDBConfig,
): Promise<{
  telemetryManager?: TelemetryManager;
  cleanup: () => Promise<void>;
}> {
  let telemetryManager: TelemetryManager | undefined;

  if (influxConfig) {
    telemetryManager = initTelemetryManager(influxConfig);
  }

  return {
    telemetryManager,
    cleanup: async (): Promise<void> => {
      if (!telemetryManager) return;

      await telemetryManager?.cleanBucket();
    },
  };
}
