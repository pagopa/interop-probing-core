import { AWSConfig, LoggerConfig } from "pagopa-interop-probing-commons";
import { z } from "zod";

const probingCallerConfig = AWSConfig.and(LoggerConfig).and(
  z
    .object({
      INTEROP_PROBING_SCHEDULER_NAME: z.string(),
      API_OPERATIONS_BASEURL: z.string(),
      SQS_ENDPOINT_POLL_QUEUE: z.string(),
      AWS_REGION: z.string(),
      LOG_LEVEL: z.string(),
      SCHEDULER_LIMIT: z.coerce.number().min(1),
      SCHEDULER_CRON_EXPRESSION: z.string(),
    })
    .transform((c) => ({
      applicationName: c.INTEROP_PROBING_SCHEDULER_NAME,
      operationsBaseUrl: c.API_OPERATIONS_BASEURL,
      sqsEndpointPollQueue: c.SQS_ENDPOINT_POLL_QUEUE,
      awsRegion: c.AWS_REGION,
      logLevel: c.LOG_LEVEL,
      schedulerLimit: c.SCHEDULER_LIMIT,
      schedulerCronExpression: c.SCHEDULER_CRON_EXPRESSION,
    }))
);

export type ProbingCallerConfig = z.infer<typeof probingCallerConfig>;

export const config: ProbingCallerConfig = {
  ...probingCallerConfig.parse(process.env),
};
