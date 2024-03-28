import { AWSConfig, LoggerConfig } from "pagopa-interop-probing-commons";
import { z } from "zod";

const probingSchedulerConfig = AWSConfig.and(LoggerConfig).and(
  z
    .object({
      INTEROP_PROBING_SCHEDULER_NAME: z.string(),
      API_OPERATIONS_BASEURL: z.string(),
      SQS_ENDPOINT_POLL_QUEUE: z.string(),
      SCHEDULER_LIMIT: z.coerce.number().min(1),
      SCHEDULER_CRON_EXPRESSION: z.string(),
    })
    .transform((c) => ({
      applicationName: c.INTEROP_PROBING_SCHEDULER_NAME,
      operationsBaseUrl: c.API_OPERATIONS_BASEURL,
      sqsEndpointPollQueue: c.SQS_ENDPOINT_POLL_QUEUE,
      schedulerLimit: c.SCHEDULER_LIMIT,
      schedulerCronExpression: c.SCHEDULER_CRON_EXPRESSION,
    })),
);

export type ProbingSchedulerConfig = z.infer<typeof probingSchedulerConfig>;

export const config: ProbingSchedulerConfig = {
  ...probingSchedulerConfig.parse(process.env),
};
