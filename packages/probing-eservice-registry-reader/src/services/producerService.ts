import { SQS } from "pagopa-interop-probing-commons";
import { EserviceDto } from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";
import { v4 as uuidv4 } from "uuid";

export const producerServiceBuilder = (sqsClient: SQS.SQSClient) => {
  return {
    async sendToServicesQueue(message: EserviceDto): Promise<void> {
      await SQS.sendMessage(
        sqsClient,
        config.sqsEndpointServicesQueue,
        JSON.stringify(message),
        config.sqsGroupId,
        {
          Header: {
            DataType: "string",
            StringValue: `{ "correlationId": "${uuidv4()}" }`,
          },
        },
      );
    },
  };
};

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
