import { z } from "zod";
import { EserviceDto, CorrelationIdDto } from "pagopa-interop-probing-models";
import { genericLogger, SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessageError } from "./domain/errors.js";

export interface SaveEserviceApi {
  params: { eserviceId: string; versionId: string };
  payload: EserviceDto;
}

const MessageBodySchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    EserviceDto,
  ),
});

export function decodeSQSMessageBody(message: SQS.Message): SaveEserviceApi {
  const parsedBody = MessageBodySchema.safeParse({ value: message.Body });
  if (!parsedBody.success) {
    throw decodeSQSMessageError(
      `Failed to decode SQS Body message with MessageId: ${
        message.MessageId
      }. Error details: ${JSON.stringify(parsedBody.error)}`,
    );
  }

  const payload = parsedBody.data.value;

  return {
    params: { eserviceId: payload.eserviceId, versionId: payload.versionId },
    payload,
  };
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
      `Failed to decode SQS correlationId attribute message with MessageId: ${
        message.MessageId
      }. Error details: ${JSON.stringify(parsed.error)}`,
    );

    return { correlationId: "MISSING_CORRELATION_ID" };
  } else {
    return { correlationId: parsed.data.value.correlationId };
  }
}
