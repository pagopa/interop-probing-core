import { AWSConfig } from "pagopa-interop-probing-commons";
import { z } from "zod";

const eServiceResponseUpdaterConfig = AWSConfig.and(
  z
    .object({
      INTEROP_PROBING_RESPONSE_UPDATER_NAME: z.string(),
      SQS_ENDPOINT_POLL_RESULT_QUEUE: z.string(),
      API_OPERATIONS_BASEURL: z.string(),
      API_OPERATIONS_ESERVICE_BASEPATH: z.string(),
    })
    .transform((c) => ({
      applicationName: c.INTEROP_PROBING_RESPONSE_UPDATER_NAME,
      sqsEndpointPollResultQueue: c.SQS_ENDPOINT_POLL_RESULT_QUEUE,
      apiOperationsBaseUrl: c.API_OPERATIONS_BASEURL,
      apiOperationsEserviceBasePath: c.API_OPERATIONS_ESERVICE_BASEPATH,
    }))
);

export type EServiceResponseUpdaterConfig = z.infer<
  typeof eServiceResponseUpdaterConfig
>;

export const config: EServiceResponseUpdaterConfig = {
  ...eServiceResponseUpdaterConfig.parse(process.env),
};
