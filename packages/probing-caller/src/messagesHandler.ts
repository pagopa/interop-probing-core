import {
  AppContext,
  decodeSQSMessageCorrelationId,
  logger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { CallerService } from "./services/callerService.js";
import { decodeSQSMessage } from "pagopa-interop-probing-commons";
import { ProducerService } from "./services/producerService.js";
import {
  UpdateResponseReceivedDto,
  TelemetryDto,
  EserviceContentDto,
} from "pagopa-interop-probing-models";
import { config } from "./utilities/config.js";
import { errorMapper } from "./utilities/errorMapper.js";

export function processMessage(
  callerService: CallerService,
  producerService: ProducerService,
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    const { correlationId } = decodeSQSMessageCorrelationId(message);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: message.MessageId,
      correlationId,
    };

    try {
      const telemetryResult: TelemetryDto = await callerService.performRequest(
        decodeSQSMessage<EserviceContentDto>(message, EserviceContentDto),
        ctx,
      );
      const pollingResult: UpdateResponseReceivedDto = {
        eserviceRecordId: telemetryResult.eserviceRecordId,
        status: telemetryResult.status,
        responseReceived: new Date().toISOString(),
      };

      await producerService.sendToTelemetryWriterQueue(telemetryResult, ctx);
      await producerService.sendToResponseUpdaterQueue(pollingResult, ctx);
    } catch (error: unknown) {
      throw errorMapper(error, logger(ctx));
    }
  };
}
