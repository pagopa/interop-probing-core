import { SQS } from "pagopa-interop-probing-commons";
import { EserviceContentDto } from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToCallerQueue(message: EserviceContentDto): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointPollQueue,
        JSON.stringify(message)
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
