import { Message } from "@aws-sdk/client-sqs";
import { Logger } from "../logging/index.js";
import { invalidSqsMessage } from "pagopa-interop-probing-models";

type EventValidation = "InvalidEvent" | "ValidEvent";

export const validateSqsMessage = (
  message: Message,
  logger: Logger,
): EventValidation => {
  if (!message.Body) {
    throw invalidSqsMessage(message.MessageId, "Message body is undefined");
  }

  try {
    const body = JSON.parse(message.Body);
    if (body.Event === "s3:TestEvent") {
      logger.warn(`Skipping TestEvent - ${body.Event}`);
      return "InvalidEvent";
    }

    return "ValidEvent";
  } catch (error) {
    throw invalidSqsMessage(message.MessageId, error);
  }
};
