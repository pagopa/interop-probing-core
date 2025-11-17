/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { afterEach, inject } from "vitest";
import { setupTestContainersVitest } from "pagopa-interop-probing-commons-test";
import { TelemetryPointInfluxModel } from "pagopa-interop-probing-models";
import {
  TelemetryWriteService,
  telemetryWriteServiceBuilder,
} from "../src/services/telemetryService.js";

export const { cleanup, telemetryManager } = await setupTestContainersVitest(
  inject("influxDBConfig")!,
);

afterEach(cleanup);

export const telemetryWriteService: TelemetryWriteService =
  telemetryWriteServiceBuilder(telemetryManager);

export const getTelemetryByEServiceRecordId = async (
  eserviceRecordId: number,
): Promise<TelemetryPointInfluxModel> => {
  const [eserviceTelemetries] =
    await telemetryManager.query<TelemetryPointInfluxModel>(
      `
      from(bucket: "${process.env.INFLUX_BUCKET}")
        |> range(start: 0)
        |> filter(fn: (r) => r["_measurement"] == "telemetry")
        |> filter(fn: (r) => r["eservice_record_id"] == "${eserviceRecordId}")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> keep(columns: ["_time", "status", "response_time", "ko_reason", "eservice_record_id"])
        |> map(fn: (r) => ({
          time: r._time,
          status: if exists r.status then r.status else "",
          response_time: if exists r.response_time then r.response_time else 0.0,
          ko_reason: if exists r.ko_reason then r.ko_reason else "",
          eservice_record_id: r.eservice_record_id,
        }))
      `,
    );

  return eserviceTelemetries;
};
