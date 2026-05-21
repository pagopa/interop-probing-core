import {
  CorrelationIdDto,
  decodeSQSCorrelationIdMessageError,
  decodeSQSMessageError,
} from "pagopa-interop-probing-models";
import { z, ZodSchema } from "zod";
import { SQS } from "./index.js";
import { genericLogger } from "../logging/logger.js";

const createMessageSchema = <T>(schema: ZodSchema<T>) =>
  z.object({
    value: z.preprocess(
      (v) => (v != null ? JSON.parse(v.toString()) : null),
      schema,
    ),
  });

export function decodeSQSMessage<T>(
  message: SQS.Message,
  schema: ZodSchema<T>,
): T {
  const MessageSchema = createMessageSchema(schema);

  const parsed = MessageSchema.safeParse({ value: message.Body });
  if (!parsed.success) {
    throw decodeSQSMessageError(message.MessageId, parsed.error);
  }

  return parsed.data.value as T;
}

const CorrelationIdAttributeSchema = z.object({
  value: z.preprocess(
    (v) => (v ? { correlationId: v.toString() } : null),
    CorrelationIdDto,
  ),
});

export function decodeSQSMessageCorrelationId(
  message: SQS.Message,
): CorrelationIdDto {
  const parsed = CorrelationIdAttributeSchema.safeParse({
    value: message.MessageAttributes?.correlationId.StringValue,
  });
  if (!parsed.success) {
    genericLogger.error(
      decodeSQSCorrelationIdMessageError(message.MessageId, parsed.error),
    );

    return { correlationId: "MISSING_CORRELATION_ID" };
  } else {
    return { correlationId: parsed.data.value.correlationId };
  }
}
