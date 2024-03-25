import {
  AWSConfig,
  ConsumerConfig,
  LoggerConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const probingCallerConfig = AWSConfig.and(ConsumerConfig)
  .and(LoggerConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_CALLER_NAME: z.string(),
        SQS_ENDPOINT_POLL_QUEUE: z.string(),
        SQS_ENDPOINT_POLL_RESULT_QUEUE: z.string(),
        SQS_ENDPOINT_TELEMETRY_RESULT_QUEUE: z.string(),
        AWS_REGION: z.string(),
        LOG_LEVEL: z.string(),
        JWT_PAYLOAD_EXPIRE_TIME_IN_SEC: z.coerce.number().min(1),
        JWT_PAYLOAD_ISSUER: z.string(),
        JWT_PAYLOAD_SUBJECT: z.string(),
        JWT_PAYLOAD_KID_KMS: z.string(),
      })
      .transform((c) => ({
        applicationName: c.INTEROP_PROBING_CALLER_NAME,
        sqsEndpointPollQueue: c.SQS_ENDPOINT_POLL_QUEUE,
        sqsEndpointPollResultQueue: c.SQS_ENDPOINT_POLL_RESULT_QUEUE,
        sqsEndpointTelemetryResultQueue: c.SQS_ENDPOINT_TELEMETRY_RESULT_QUEUE,
        awsRegion: c.AWS_REGION,
        logLevel: c.LOG_LEVEL,
        jwtPayloadExpireTimeInSec: c.JWT_PAYLOAD_EXPIRE_TIME_IN_SEC,
        jwtPayloadIssuer: c.JWT_PAYLOAD_ISSUER,
        jwtPayloadSubject: c.JWT_PAYLOAD_SUBJECT,
        jwtPayloadKidKms: c.JWT_PAYLOAD_KID_KMS,
      }))
  );

export type ProbingCallerConfig = z.infer<typeof probingCallerConfig>;

export const config: ProbingCallerConfig = {
  ...probingCallerConfig.parse(process.env),
};
