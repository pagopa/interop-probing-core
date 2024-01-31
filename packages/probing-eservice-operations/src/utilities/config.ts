import { CommonConfig } from "pagopa-interop-probing-commons";
import { DbConfig } from "./dbConfig.js";
import { z } from "zod";

const eServiceOperationsConfig = CommonConfig.and(DbConfig).and(
  z
    .object({
      TOLERANCE_MULTIPLIER_IN_MINUTES: z.string(),
      SCHEMA_NAME: z.string(),
      DEFAULT_AWS_REGION: z.string(),
    })
    .transform((c) => ({
      minOfTolleranceMultiplier: c.TOLERANCE_MULTIPLIER_IN_MINUTES,
      schemaName: c.SCHEMA_NAME,
      defaultAwsRegion: c.DEFAULT_AWS_REGION
    }))
);

export type EServiceOperationsConfig = z.infer<typeof eServiceOperationsConfig>;

export const config: EServiceOperationsConfig = {
  ...eServiceOperationsConfig.parse(process.env),
};
