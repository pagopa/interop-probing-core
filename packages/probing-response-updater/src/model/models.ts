import { z } from "zod";
import { EserviceStatus } from "pagopa-interop-probing-models";
import { Message } from "@aws-sdk/client-sqs";
import { decodeSQSMessageError } from "./domain/errors.js";

export interface UpdateResponseReceivedApi {
  params: { eserviceRecordId: number };
  payload: ChangeResponseReceived;
}

export const ChangeResponseReceived = z.object({
  responseReceived: z.date().transform((date) => date.toISOString()),
  status: EserviceStatus,
});

export type ChangeResponseReceived = z.infer<typeof ChangeResponseReceived>;

const UpdateResponseReceivedDto = z.object({
  eserviceRecordId: z.number(),
  responseReceived: z.string(),
  status: EserviceStatus,
});

export type UpdateResponseReceivedDto = z.infer<
  typeof UpdateResponseReceivedDto
>;

const MessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    UpdateResponseReceivedDto
  ),
});

export function decodeSQSMessage(message: Message): UpdateResponseReceivedApi {
  const parsed = MessageSchema.safeParse({ value: message.Body });
  if (!parsed.success) {
    throw decodeSQSMessageError(`Failed to decode SQS message with MessageId: ${message.MessageId}. Error details: ${JSON.stringify(parsed.error)}`)
  }

  const { eserviceRecordId, responseReceived, status } = parsed.data.value;

  return {
    params: { eserviceRecordId },
    payload: { responseReceived, status },
  };
}
