import { SQS } from "pagopa-interop-probing-commons";
import { EserviceDto } from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToServicesQueue(message: EserviceDto): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointServicesQueue,
        JSON.stringify(message),
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
