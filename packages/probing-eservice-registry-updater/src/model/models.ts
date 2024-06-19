import { z } from "zod";
import { EserviceDto, HeadersMessageDto } from "pagopa-interop-probing-models";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessageError } from "./domain/errors.js";
import { v4 as uuidv4 } from "uuid";

export interface SaveEserviceApi {
  params: { eserviceId: string; versionId: string };
  payload: EserviceDto;
}

const BodyMessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    EserviceDto,
  ),
});

const HeaderMessageSchema = z.object({
  value: z.preprocess(
    (v) => (v ? JSON.parse(v.toString()) : null),
    HeadersMessageDto,
  ),
});

export function decodeSQSBodyMessage(message: SQS.Message): SaveEserviceApi {
  const parsedBody = BodyMessageSchema.safeParse({ value: message.Body });
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

export function decodeSQSHeadersMessage(
  message: SQS.Message,
): HeadersMessageDto {
  try {
    const parsedHeaders = HeaderMessageSchema.parse({
      value: message.MessageAttributes?.Header.StringValue,
    });
    return {
      correlationId: parsedHeaders.value.correlationId,
    };
  } catch (_err) {
    return {
      correlationId: uuidv4(),
    };
  }
}
