import { Message } from "@aws-sdk/client-sqs";
import { CorrelationIdDto } from "pagopa-interop-probing-models";
import { genericLogger } from "../index.js";
import { z } from "zod";

const CorrelationIdAttributeSchema = z.object({
  value: z.preprocess(
    (v) => (v ? { correlationId: v.toString() } : null),
    CorrelationIdDto,
  ),
});

export function decodeSQSMessageCorrelationId(
  message: Message,
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
