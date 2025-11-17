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
import { errorMapper } from "./utilities/errorMapper.js";
import { UpdateResponseReceivedDto } from "pagopa-interop-probing-models";

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
}
