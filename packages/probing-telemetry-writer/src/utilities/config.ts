import {
  AWSConfig,
  ConsumerConfig,
  InfluxDBConfig,
  LoggerConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const telemetryWriterConfig = AWSConfig.and(ConsumerConfig)
  .and(LoggerConfig)
  .and(InfluxDBConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_TELEMETRY_WRITER_NAME: z.string(),
        SQS_ENDPOINT_TELEMETRY_RESULT_QUEUE: z.string(),
      })
      .transform((c) => ({
        applicationName: c.INTEROP_PROBING_TELEMETRY_WRITER_NAME,
        sqsEndpointTelemetryResultQueue: c.SQS_ENDPOINT_TELEMETRY_RESULT_QUEUE,
      })),
  );

export type TelemetryWriterConfig = z.infer<typeof telemetryWriterConfig>;

export const config: TelemetryWriterConfig = {
  ...telemetryWriterConfig.parse(process.env),
};
