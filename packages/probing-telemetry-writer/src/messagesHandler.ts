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
import { TelemetryDto } from "pagopa-interop-probing-models";
import { errorMapper } from "./utilities/errorMapper.js";

const processMessage = async (
  message: SQS.Message,
  service: TelemetryWriteService,
): Promise<void> => {
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

export function processBatch(
  service: TelemetryWriteService,
): (messages: SQS.Message[]) => Promise<void> {
  return async (messages: SQS.Message[]): Promise<void> => {
    await Promise.all(
      messages.map((message) => processMessage(message, service)),
    );
  };
}
