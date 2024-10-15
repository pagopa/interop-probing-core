import {
  LoggerConfig,
  KafkaConsumerConfig,
  KafkaTopicConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const eServiceEventConsumerConfig = LoggerConfig.and(KafkaConsumerConfig)
  .and(KafkaTopicConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_ESERVICE_EVENT_CONSUMER_NAME: z.string(),
        API_OPERATIONS_BASEURL: z.string(),
      })
      .transform((c) => ({
        applicationName: c.INTEROP_PROBING_ESERVICE_EVENT_CONSUMER_NAME,
        operationsBaseUrl: c.API_OPERATIONS_BASEURL,
      })),
  );

export type EserviceEventConsumerConfig = z.infer<
  typeof eServiceEventConsumerConfig
>;

export const config: EserviceEventConsumerConfig = {
  ...eServiceEventConsumerConfig.parse(process.env),
};
