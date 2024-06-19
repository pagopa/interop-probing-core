import {
  AppContext,
  SQS,
  WithSQSMessageId,
  logger,
} from "pagopa-interop-probing-commons";
import { OperationsService } from "./services/operationsService.js";
import {
  decodeSQSBodyMessage,
  decodeSQSHeadersMessage,
} from "./model/models.js";
import { config } from "./utilities/config.js";
import { makeApplicationError } from "./model/domain/errors.js";

export function processMessage(
  service: OperationsService,
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    const headers = decodeSQSHeadersMessage(message);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      correlationId: headers.correlationId,
      messageId: message.MessageId,
    };

    try {
      await service.saveEservice(decodeSQSBodyMessage(message), ctx);
    } catch (error: unknown) {
      throw makeApplicationError(error, logger(ctx));
    }
  };
}
