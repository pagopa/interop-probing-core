import { z } from "zod";

export const InfluxDBConfig = z
  .object({
    INFLUX_DB_URL: z.string().url(),
    INFLUX_TOKEN: z.string(),
    INFLUX_ORG: z.string(),
    INFLUX_BUCKET: z.string(),
    INFLUX_PRECISION: z.enum(["ns", "us", "ms", "s"]).default("ms"),
  })
  .transform((c) => ({
    influxUrl: c.INFLUX_DB_URL,
    influxToken: c.INFLUX_TOKEN,
    influxOrg: c.INFLUX_ORG,
    influxBucket: c.INFLUX_BUCKET,
    influxPrecision: c.INFLUX_PRECISION,
  }));

export type InfluxDBConfig = z.infer<typeof InfluxDBConfig>;
