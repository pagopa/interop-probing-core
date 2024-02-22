import { SQS } from "pagopa-interop-probing-commons";
import { OperationsService } from "./services/operationsService.js";
import { decodeSQSMessage } from "./model/models.js";
import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";

export function processMessage(
  service: OperationsService
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    try {
      await service.updateResponseReceived(decodeSQSMessage(message));
    } catch (e: unknown) {
      throw makeApplicationError(
        e instanceof ApplicationError
          ? e
          : new Error(
              `Unexpected error handling message with MessageId: ${message.MessageId}. Details: ${e}`
            )
      );
    }
  };
}
