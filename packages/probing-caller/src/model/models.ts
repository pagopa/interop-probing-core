import { z } from "zod";
import {
  EserviceStatus,
  EserviceTechnology,
  responseStatus,
} from "pagopa-interop-probing-models";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessageError } from "./domain/errors.js";

export const PollingDto = z.object({
  eserviceRecordId: z.number().min(1),
  status: EserviceStatus,
  responseReceived: z.string().datetime({ offset: true }),
});

export type PollingDto = z.infer<typeof PollingDto>;

const TelemetryOkDto = z.object({
  status: z.literal(responseStatus.ok),
  eserviceRecordId: z.number().min(1),
  checkTime: z.string().regex(/^\d+$/).min(1),
  responseTime: z.number(),
});

export type TelemetryOkDto = z.infer<typeof TelemetryOkDto>;

const TelemetryKoDto = z.object({
  status: z.literal(responseStatus.ko),
  eserviceRecordId: z.number().min(1),
  checkTime: z.string().regex(/^\d+$/).min(1),
  responseTime: z.number().optional(),
  koReason: z.string().min(1).max(2048),
});

export type TelemetryKoDto = z.infer<typeof TelemetryKoDto>;

const TelemetryDto = z.discriminatedUnion("status", [
  TelemetryOkDto,
  TelemetryKoDto,
]);

export type TelemetryDto = z.infer<typeof TelemetryDto>;

const EserviceContentDto = z.object({
  eserviceRecordId: z.number(),
  technology: EserviceTechnology,
  basePath: z.array(z.string()),
  audience: z.array(z.string()),
});

export type EserviceContentDto = z.infer<typeof EserviceContentDto>;

const MessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    EserviceContentDto
  ),
});

export function decodeSQSMessage(message: SQS.Message): EserviceContentDto {
  const parsed = MessageSchema.safeParse({ value: message.Body });
  if (!parsed.success) {
    throw decodeSQSMessageError(
      `Failed to decode SQS message with MessageId: ${
        message.MessageId
      }. Error details: ${JSON.stringify(parsed.error)}`
    );
  }

  return parsed.data.value;
}
