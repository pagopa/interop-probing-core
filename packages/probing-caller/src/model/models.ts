import { z } from "zod";
import { EserviceContentDto } from "pagopa-interop-probing-models";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessageError } from "./domain/errors.js";

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
