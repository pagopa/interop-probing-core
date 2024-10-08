import {
  AppContext,
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
