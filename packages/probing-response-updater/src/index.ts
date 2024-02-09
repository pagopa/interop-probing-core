import { logger, SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApiClient } from "../../probing-eservice-operations/src/model/generated/api.js";
import { processMessage } from "./messagesHandler.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "./services/eserviceService.js";

const apiClient = createApiClient(config.operationsBaseUrl);

const eserviceService: EserviceService = eServiceServiceBuilder(apiClient);

const sqsClient: SQS.SQSClient = await SQS.instantiateSQSClient(
  { region: config.awsRegion },
  config.applicationName
);

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollResultQueue,
    consumerPollingTimeout: config.consumerPollingTimeout,
  },
  async (message: SQS.Message) =>
    (
      await processMessage(eserviceService)
    )(message)
).catch(logger.error);
