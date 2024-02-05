import {
  logger,
  instantiateSQSClient,
  sqsRunConsumer,
} from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import {
  EserviceService,
  eServiceServiceClient,
} from "./services/eserviceService.js";
import { decodeSQSMessage } from "./model/models.js";
import { Message } from "@aws-sdk/client-sqs";
import { api } from "../../probing-eservice-operations/src/model/generated/api.js";

const sqsClient = await instantiateSQSClient(
  { awsRegion: config.awsRegion },
  config.applicationName
);

const eserviceService: EserviceService = eServiceServiceClient(api);

async function processMessage(message: Message): Promise<void> {
  try {
    await eserviceService.updateResponseReceived(decodeSQSMessage(message));
    logger.info(
      `eService response received updated for MessageId: ${message.MessageId}.`
    );
  } catch (e) {
    throw new Error(
      `Error during eService message handling. MessageId: ${message.MessageId}. ${e}`
    );
  }
}

await sqsRunConsumer(
  sqsClient,
  config.sqsEndpointPollResultQueue,
  processMessage
).catch(logger.error);
