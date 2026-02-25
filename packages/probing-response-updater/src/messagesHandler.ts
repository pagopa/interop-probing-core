import {
  AppContext,
  decodeSQSMessage,
  decodeSQSMessageCorrelationId,
  logger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { OperationsService } from "./services/operationsService.js";
import { config } from "./utilities/config.js";
import { UpdateResponseReceivedDto } from "pagopa-interop-probing-models";
import { errorMapper } from "./utilities/errorMapper.js";

const processMessage = async (
  message: SQS.Message,
  service: OperationsService,
): Promise<void> => {
  const { correlationId } = decodeSQSMessageCorrelationId(message);
  const ctx: WithSQSMessageId<AppContext> = {
    serviceName: config.applicationName,
    messageId: message.MessageId,
    correlationId,
  };

  try {
    const decodedMessage = decodeSQSMessage<UpdateResponseReceivedDto>(
      message,
      UpdateResponseReceivedDto,
    );

    await service.updateResponseReceived(
      decodedMessage.eserviceRecordId,
      {
        status: decodedMessage.status,
        responseReceived: decodedMessage.responseReceived,
      },
      ctx,
    );
  } catch (error: unknown) {
    throw errorMapper(error, logger(ctx));
  }
};

export function processBatch(
  service: OperationsService,
): (messages: SQS.Message[]) => Promise<void> {
  return async (messages: SQS.Message[]): Promise<void> => {
    await Promise.all(
      messages.map((message) => processMessage(message, service)),
    );
  };
}
