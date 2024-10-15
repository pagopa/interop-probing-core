import {
  AppContext,
  SQS,
  WithSQSMessageId,
  decodeSQSMessageCorrelationId,
  logger,
} from "pagopa-interop-probing-commons";
import { OperationsService } from "./services/operationsService.js";
import { decodeSQSMessageBody } from "./model/models.js";
import { config } from "./utilities/config.js";
import { makeApplicationError } from "./model/domain/errors.js";

export function processMessage(
  service: OperationsService,
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    const { correlationId } = decodeSQSMessageCorrelationId(message);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: message.MessageId,
      correlationId,
    };

    try {
      await service.saveEservice(decodeSQSMessageBody(message), ctx);
    } catch (error: unknown) {
      throw makeApplicationError(error, logger(ctx));
    }
  };
}
