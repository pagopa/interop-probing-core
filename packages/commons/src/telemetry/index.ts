import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { match, P } from "ts-pattern";
import {
  telemetryWriteError,
  telemetryQueryError,
  telemetryCleanBucketError,
} from "./telemetryManagerErrors.js";
import { InfluxDBConfig } from "../config/influxDb.js";

export interface TelemetryDimension {
  name: string;
  value: string;
}

export interface TelemetryField {
  name: string;
  value: string | number | boolean;
}

export interface TelemetryRecord {
  measurement: string;
  timestamp: string | number | Date;
  dimensions: TelemetryDimension[];
  fields: TelemetryField[];
}

export type TelemetryManager = {
  writeRecord(telemetry: TelemetryRecord): Promise<void>;
  query<T = Record<string, unknown>>(query: string): Promise<T[]>;
  cleanBucket(): Promise<void>;
};

export function initTelemetryManager(config: InfluxDBConfig) {
  const client = new InfluxDB({
    url: config.influxUrl,
    token: config.influxToken,
  });

  const writeApi = client.getWriteApi(
    config.influxOrg,
    config.influxBucket,
    config.influxPrecision,
  );

  const queryApi = client.getQueryApi(config.influxOrg);

  return {
    async writeRecord(telemetry: TelemetryRecord): Promise<void> {
      try {
        const point = new Point(telemetry.measurement);

        for (const d of telemetry.dimensions) {
          point.tag(d.name, d.value);
        }

        for (const f of telemetry.fields) {
          match(f.value)
            .with(P.number, (v) => point.floatField(f.name, v))
            .with(P.boolean, (v) => point.booleanField(f.name, v))
            .with(P.string, (v) => point.stringField(f.name, v))
            .exhaustive();
        }

        point.timestamp(new Date(telemetry.timestamp));

        writeApi.writePoint(point);
        await writeApi.flush();
      } catch (error) {
        throw telemetryWriteError(telemetry, error);
      }
    },

    async query<T = unknown>(query: string): Promise<T[]> {
      try {
        return await queryApi.collectRows<T>(query);
      } catch (error) {
        throw telemetryQueryError(query, error);
      }
    },

    async cleanBucket(): Promise<void> {
      try {
        await fetch(
          `${config.influxUrl}/api/v2/delete?org=${config.influxOrg}&bucket=${config.influxBucket}`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${config.influxToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              start: "1970-01-01T00:00:00Z",
              stop: "2100-01-01T00:00:00Z",
            }),
          },
        );
      } catch (error) {
        throw telemetryCleanBucketError(error);
      }
    },
  };
}

export { telemetryCleanBucketError, telemetryQueryError, telemetryWriteError };
