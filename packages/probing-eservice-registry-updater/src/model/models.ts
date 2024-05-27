import { z } from "zod";
import { EserviceDto } from "pagopa-interop-probing-models";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessageError } from "./domain/errors.js";

export interface SaveEserviceApi {
  params: { eserviceId: string; versionId: string };
  payload: EserviceDto;
}

const MessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    EserviceDto,
  ),
});

export function decodeSQSMessage(message: SQS.Message): SaveEserviceApi {
  const parsed = MessageSchema.safeParse({ value: message.Body });
  if (!parsed.success) {
    throw decodeSQSMessageError(
      `Failed to decode SQS message with MessageId: ${
        message.MessageId
      }. Error details: ${JSON.stringify(parsed.error)}`,
    );
  }

  const payload = parsed.data.value;

  return {
    params: { eserviceId: payload.eserviceId, versionId: payload.versionId },
    payload,
  };
}
