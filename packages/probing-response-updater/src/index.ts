import { logger, SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApiClient } from "../../probing-eservice-operations/src/model/generated/api.js";
import { processMessage } from "./messagesHandler.js";
import {
  OperationsService,
  operationsServiceBuilder,
} from "./services/operationsService.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);

const OperationsService: OperationsService = operationsServiceBuilder(operationsApiClient);

const sqsClient: SQS.SQSClient = await SQS.instantiateClient(
  { region: config.awsRegion },
  config.applicationName
);

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollResultQueue,
    consumerPollingTimeout: config.consumerPollingTimeout,
  },
  processMessage(OperationsService)
).catch(logger.error);
