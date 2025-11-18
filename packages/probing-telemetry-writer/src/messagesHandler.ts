import {
  AppContext,
  decodeSQSMessage,
  decodeSQSMessageCorrelationId,
  logger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { TelemetryWriteService } from "./services/telemetryService.js";
import { config } from "./utilities/config.js";
import { errorMapper } from "./utilities/errorMapper.js";
import { TelemetryDto } from "pagopa-interop-probing-models";

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
      const decodedMessage = decodeSQSMessage<TelemetryDto>(
        message,
        TelemetryDto,
      );

      await service.writeRecord(decodedMessage, logger(ctx));
    } catch (error: unknown) {
      throw errorMapper(error, logger(ctx));
    }
  };
}
