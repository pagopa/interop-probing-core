import { logger, SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApiClient } from "../../probing-eservice-operations/src/model/generated/api.js";
import { processMessage } from "./messagesHandler.js";
import {
  ResponseUpdaterService,
  responseUpdaterServiceBuilder,
} from "./services/responseUpdaterService.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);

const responseUpdaterService: ResponseUpdaterService = responseUpdaterServiceBuilder(operationsApiClient);

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
  processMessage(responseUpdaterService)
).catch(logger.error);
