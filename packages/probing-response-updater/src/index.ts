import {
  logger,
  instantiateSQSClient,
  sqsRunConsumer,
} from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "./services/eserviceService.js";
import { decodeSQSMessage } from "./model/models.js";
import { Message } from "@aws-sdk/client-sqs";
import { api } from "../../probing-eservice-operations/src/model/generated/api.js";
import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";

const sqsClient = await instantiateSQSClient(
  { awsRegion: config.awsRegion },
  config.applicationName
);

const eserviceService: EserviceService = eServiceServiceBuilder(api);

export async function processMessage(
  service: EserviceService
): Promise<(message: Message) => Promise<void>> {
  return async (message: Message): Promise<void> => {
    try {
      await service.updateResponseReceived(decodeSQSMessage(message));
    } catch (e: unknown) {
      throw makeApplicationError(
        e instanceof ApplicationError
          ? e
          : new Error(
              `Unexpected error handling message with MessageId: ${message.MessageId}. Details: ${e}`
            )
      );
    }
  };
}

await sqsRunConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollResultQueue,
    defaultConsumerTimeout: config.defaultConsumerTimeout,
  },
  async (message: Message) => (await processMessage(eserviceService))(message)
).catch(logger.error);
