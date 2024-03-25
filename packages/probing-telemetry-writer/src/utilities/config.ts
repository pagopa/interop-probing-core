import {
  AWSConfig,
  ConsumerConfig,
  LoggerConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const telemetryWriterConfig = AWSConfig.and(ConsumerConfig)
  .and(LoggerConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_TELEMETRY_WRITER_NAME: z.string(),
        SQS_ENDPOINT_TELEMETRY_RESULT_QUEUE: z.string(),
        TIMESTREAM_RETRIES: z.coerce.number().min(1),
        TIMESTREAM_TABLE: z.string(),
        TIMESTREAM_DATABASE: z.string(),
      })
      .transform((c) => ({
        applicationName: c.INTEROP_PROBING_TELEMETRY_WRITER_NAME,
        sqsEndpointTelemetryResultQueue: c.SQS_ENDPOINT_TELEMETRY_RESULT_QUEUE,
        timestreamRetries: c.TIMESTREAM_RETRIES,
        timestreamTable: c.TIMESTREAM_TABLE,
        timestreamDatabase: c.TIMESTREAM_DATABASE,
      }))
  );

export type TelemetryWriterConfig = z.infer<typeof telemetryWriterConfig>;

export const config: TelemetryWriterConfig = {
  ...telemetryWriterConfig.parse(process.env),
};
