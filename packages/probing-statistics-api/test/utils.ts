/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { afterEach, inject } from "vitest";
import {
  telemetryQueryServiceBuilder,
  TelemetryQueryService,
} from "../src/services/telemetryQueryService.js";
import {
  TelemetryPoint,
  TelemetryDimensions,
  TelemetryFields,
  TelemetryMeasurement,
  TelemetryStatus,
} from "pagopa-interop-probing-models";
import { setupTestContainersVitest } from "pagopa-interop-probing-commons-test";
import { TelemetryRecord } from "pagopa-interop-probing-commons";
import { statisticsServiceBuilder } from "../src/services/statisticsService.js";

export const { cleanup, telemetryManager } = await setupTestContainersVitest(
  inject("influxDBConfig")!,
);

afterEach(cleanup);

export const telemetryQueryService: TelemetryQueryService =
  telemetryQueryServiceBuilder(telemetryManager!);
export const statisticsService = statisticsServiceBuilder(
  telemetryQueryService,
);

export const mockStatistic = (
  overrides: Partial<TelemetryPoint> = {},
): TelemetryPoint => ({
  time: overrides.time ?? new Date().toISOString(),
  status: overrides.status ?? "OK",
  responseTime: overrides.responseTime ?? 120,
});

export const mockTelemetryRecord = (params: {
  eserviceRecordId: number;
  status: TelemetryStatus;
  responseTime: number;
  timestamp: Date | number;
  koReason?: string;
}): TelemetryRecord => {
  const dimensions: Array<{ name: TelemetryDimensions; value: string }> = [
    {
      name: TelemetryDimensions.ESERVICE_RECORD_ID,
      value: String(params.eserviceRecordId),
    },
  ];

  if (params.status === "KO" && params.koReason) {
    dimensions.push({
      name: TelemetryDimensions.KO_REASON,
      value: params.koReason,
    });
  }

  const fields: Array<{ name: TelemetryFields; value: string | number }> = [
    {
      name: TelemetryFields.STATUS,
      value: params.status,
    },
    {
      name: TelemetryFields.RESPONSE_TIME,
      value: Number(params.responseTime),
    },
  ];

  return {
    measurement: TelemetryMeasurement.TELEMETRY,
    timestamp: params.timestamp,
    dimensions,
    fields,
  };
};

export const addTelemetry = async (
  telemetry: TelemetryRecord,
): Promise<void> => {
  await telemetryManager.writeRecord(telemetry);
};
