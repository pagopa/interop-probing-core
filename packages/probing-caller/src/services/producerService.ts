import {
  AppContext,
  logger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import {
  UpdateResponseReceivedDto,
  TelemetryDto,
} from "pagopa-interop-probing-models";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToTelemetryWriterQueue(
      message: TelemetryDto,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<void> {
      logger(ctx).info(
        `Performing sendToTelemetryWriterQueue with eserviceRecordId ${message.eserviceRecordId}. Payload: ${JSON.stringify(message)}`,
      );
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointTelemetryResultQueue,
        JSON.stringify(message),
        ctx.correlationId,
      );
    },
    async sendToResponseUpdaterQueue(
      message: UpdateResponseReceivedDto,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<void> {
      logger(ctx).info(
        `Performing sendToResponseUpdaterQueue with eserviceRecordId ${message.eserviceRecordId}. Payload: ${JSON.stringify(message)}`,
      );
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointPollResultQueue,
        JSON.stringify(message),
        ctx.correlationId,
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
