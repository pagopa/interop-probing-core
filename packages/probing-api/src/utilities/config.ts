import { HTTPServerConfig, LoggerConfig } from "pagopa-interop-probing-commons";
import { z } from "zod";

const apiConfig = HTTPServerConfig.and(LoggerConfig).and(
  z
    .object({
      AWS_REGION: z.string(),
      API_OPERATIONS_BASEURL: z.string(),
      TOLERANCE_MULTIPLIER_IN_MINUTES: z.coerce.number().min(1),
    })
    .transform((c) => ({
      awsRegion: c.AWS_REGION,
      operationsBaseUrl: c.API_OPERATIONS_BASEURL,
      minOfTolleranceMultiplier: c.TOLERANCE_MULTIPLIER_IN_MINUTES,
    }))
);

export type ApiConfig = z.infer<typeof apiConfig>;

export const config: ApiConfig = {
  ...apiConfig.parse(process.env),
};
