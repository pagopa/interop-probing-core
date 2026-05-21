import {
  AppContext,
  logger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { EserviceContentDto } from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToCallerQueue(
      message: EserviceContentDto,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<void> {
      logger(ctx).info(
        `Performing sendToCallerQueue with eserviceRecordId ${message.eserviceRecordId}. Payload: ${JSON.stringify(message)}`,
      );
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointPollQueue,
        JSON.stringify(message),
        ctx.correlationId,
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
