import {
  AWSConfig,
  ConsumerConfig,
  LoggerConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const eServiceRegistryUpdaterConfig = AWSConfig.and(ConsumerConfig)
  .and(LoggerConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_ESERVICE_REGISTRY_UPDATER_NAME: z.string(),
        SQS_ENDPOINT_SERVICES_QUEUE: z.string(),
        API_OPERATIONS_BASEURL: z.string(),
      })
      .transform((c) => ({
        applicationName: c.INTEROP_PROBING_ESERVICE_REGISTRY_UPDATER_NAME,
        sqsEndpointServicesQueue: c.SQS_ENDPOINT_SERVICES_QUEUE,
        operationsBaseUrl: c.API_OPERATIONS_BASEURL,
      }))
  );

export type EServiceRegistryUpdaterConfig = z.infer<
  typeof eServiceRegistryUpdaterConfig
>;

export const config: EServiceRegistryUpdaterConfig = {
  ...eServiceRegistryUpdaterConfig.parse(process.env),
};
