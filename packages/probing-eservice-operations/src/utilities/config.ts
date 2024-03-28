import {
  HTTPServerConfig,
  LoggerConfig,
  AWSConfig,
} from "pagopa-interop-probing-commons";
import { DbConfig } from "./dbConfig.js";
import { z } from "zod";

const eServiceOperationsConfig = HTTPServerConfig.and(LoggerConfig)
  .and(AWSConfig)
  .and(DbConfig)
  .and(
    z
      .object({
        TOLERANCE_MULTIPLIER_IN_MINUTES: z.coerce.number().min(1),
        SCHEMA_NAME: z.string(),
      })
      .transform((c) => ({
        minOfTolleranceMultiplier: c.TOLERANCE_MULTIPLIER_IN_MINUTES,
        schemaName: c.SCHEMA_NAME,
      })),
  );

export type EServiceOperationsConfig = z.infer<typeof eServiceOperationsConfig>;

export const config: EServiceOperationsConfig = {
  ...eServiceOperationsConfig.parse(process.env),
};
