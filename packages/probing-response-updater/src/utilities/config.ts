import {
  AWSConfig,
  ConsumerConfig,
  LoggerConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const eServiceResponseUpdaterConfig = AWSConfig.and(ConsumerConfig)
  .and(LoggerConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_RESPONSE_UPDATER_NAME: z.string(),
        SQS_ENDPOINT_POLL_RESULT_QUEUE: z.string(),
        API_OPERATIONS_BASEURL: z.string(),
      })
      .transform((c) => ({
        applicationName: c.INTEROP_PROBING_RESPONSE_UPDATER_NAME,
        sqsEndpointPollResultQueue: c.SQS_ENDPOINT_POLL_RESULT_QUEUE,
        operationsBaseUrl: c.API_OPERATIONS_BASEURL,
      }))
  );

export type EServiceResponseUpdaterConfig = z.infer<
  typeof eServiceResponseUpdaterConfig
>;

export const config: EServiceResponseUpdaterConfig = {
  ...eServiceResponseUpdaterConfig.parse(process.env),
};
