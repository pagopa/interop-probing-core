import { genericLogger, logger, SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { processBatch } from "./messagesHandler.js";
import {
  CallerService,
  callerServiceBuilder,
} from "./services/callerService.js";
import {
  ProducerService,
  producerServiceBuilder,
} from "./services/producerService.js";
import {
  apiClientBuilder,
  ApiClientHandler,
} from "./utilities/apiClientHandler.js";
import {
  kmsClientBuilder,
  KMSClientHandler,
} from "./utilities/kmsClientHandler.js";

const sqsClient: SQS.SQSClient = await SQS.instantiateClient({
  region: config.awsRegion,
  logLevel: config.logLevel,
});
const kmsClientHandler: KMSClientHandler = kmsClientBuilder();
const apiClientHandler: ApiClientHandler = apiClientBuilder();
const callerService: CallerService = callerServiceBuilder(
  apiClientHandler,
  kmsClientHandler,
);
const producerService: ProducerService = producerServiceBuilder(sqsClient);

await SQS.runBatchConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollQueue,
    maxNumberOfMessages: config.maxNumberOfMessages,
    waitTimeSeconds: config.waitTimeSeconds,
    visibilityTimeout: config.visibilityTimeout,
    receiveMsgsCalls: config.receiveMsgsCalls,
    receiveMsgsConcurrency: config.receiveMsgsConcurrency,
    serviceName: config.applicationName,
  },
  processBatch(callerService, producerService),
  logger({ serviceName: config.applicationName }),
).catch(genericLogger.error);
