import {
  AppContext,
  decodeSQSMessageCorrelationId,
  logger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { TelemetryWriteService } from "./services/telemetryService.js";
import { decodeSQSMessage } from "./model/models.js";
import { makeApplicationError } from "./model/domain/errors.js";
import { config } from "./utilities/config.js";

export function processMessage(
  service: TelemetryWriteService,
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    const { correlationId } = decodeSQSMessageCorrelationId(message);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: message.MessageId,
      correlationId,
    };

    try {
      await service.writeRecord(decodeSQSMessage(message), ctx);
    } catch (e: unknown) {
      throw makeApplicationError(e, logger(ctx));
    }
  };
}
