import {
  AppContext,
  decodeSQSMessageCorrelationId,
  decodeSQSMessage,
  SQS,
  WithSQSMessageId,
  logger,
} from "pagopa-interop-probing-commons";
import { CallerService } from "./services/callerService.js";
import { ProducerService } from "./services/producerService.js";
import {
  UpdateResponseReceivedDto,
  TelemetryDto,
  EserviceContentDto,
} from "pagopa-interop-probing-models";
import { config } from "./utilities/config.js";
import { errorMapper } from "./utilities/errorMapper.js";

const processMessage = async (
  message: SQS.Message,
  callerService: CallerService,
  producerService: ProducerService,
): Promise<void> => {
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

    await Promise.all([
      producerService.sendToTelemetryWriterQueue(telemetryResult, ctx),
      producerService.sendToResponseUpdaterQueue(pollingResult, ctx),
    ]);
  } catch (error: unknown) {
    throw errorMapper(error, logger(ctx));
  }
};

export function processBatch(
  callerService: CallerService,
  producerService: ProducerService,
): (messages: SQS.Message[]) => Promise<void> {
  return async (messages: SQS.Message[]): Promise<void> => {
    await Promise.all(
      messages.map((message) =>
        processMessage(message, callerService, producerService),
      ),
    );
  };
}
