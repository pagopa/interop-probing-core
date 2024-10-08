import { AppContext, SQS } from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import {
  UpdateResponseReceivedDto,
  TelemetryDto,
} from "pagopa-interop-probing-models";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToTelemetryWriterQueue(
      message: TelemetryDto,
      ctx: AppContext,
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
      ctx: AppContext,
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
