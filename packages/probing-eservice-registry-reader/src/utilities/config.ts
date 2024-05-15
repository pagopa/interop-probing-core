import { AWSConfig, LoggerConfig } from "pagopa-interop-probing-commons";
import { z } from "zod";

const probingEserviceRegistryReaderConfig = AWSConfig.and(LoggerConfig).and(
  z
    .object({
      INTEROP_PROBING_ESERVICE_REGISTRY_READER_NAME: z.string(),
      SQS_ENDPOINT_SERVICES_QUEUE: z.string(),
      S3_BUCKET_NAME: z.string(),
      S3_BUCKET_KEY: z.string(),
      SQS_GROUP_ID: z.string(),
    })
    .transform((c) => ({
      applicationName: c.INTEROP_PROBING_ESERVICE_REGISTRY_READER_NAME,
      bucketS3Name: c.S3_BUCKET_NAME,
      bucketS3Key: c.S3_BUCKET_KEY,
      sqsEndpointServicesQueue: c.SQS_ENDPOINT_SERVICES_QUEUE,
      sqsGroupId: c.SQS_GROUP_ID,
    })),
);

export type ProbingEserviceRegistryReaderConfig = z.infer<
  typeof probingEserviceRegistryReaderConfig
>;

export const config: ProbingEserviceRegistryReaderConfig = {
  ...probingEserviceRegistryReaderConfig.parse(process.env),
};
