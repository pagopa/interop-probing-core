import { genericLogger, logger, SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import { processMessage } from "./messagesHandler.js";
import {
  OperationsService,
  operationsServiceBuilder,
} from "./services/operationsService.js";

const operationsApiClient =
  probingEserviceOperationsApi.createEServicesApiClient(
    config.operationsBaseUrl,
  );

const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);

const sqsClient: SQS.SQSClient = await SQS.instantiateClient({
  region: config.awsRegion,
  logLevel: config.logLevel,
});

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollResultQueue,
    maxNumberOfMessages: config.maxNumberOfMessages,
    waitTimeSeconds: config.waitTimeSeconds,
    visibilityTimeout: config.visibilityTimeout,
  },
  processMessage(operationsService),
  logger({ serviceName: config.applicationName }),
).catch(genericLogger.error);
