import { AppContext, SQS } from "pagopa-interop-probing-commons";
import { EserviceDto } from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToServicesQueue(
      message: EserviceDto,
      ctx: AppContext,
    ): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointServicesQueue,
        JSON.stringify(message),
        ctx.correlationId,
        config.sqsGroupId,
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
