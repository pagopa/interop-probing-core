import { SQS } from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import { UpdateResponseReceivedDto, TelemetryDto } from "pagopa-interop-probing-models";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToTelemetryWriterQueue(message: TelemetryDto): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointTelemetryResultQueue,
        JSON.stringify(message)
      );
    },
    async sendToResponseUpdaterQueue(message: UpdateResponseReceivedDto): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointPollResultQueue,
        JSON.stringify(message)
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
