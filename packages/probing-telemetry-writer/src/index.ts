import {
  genericLogger,
  initTelemetryManager,
  logger,
  SQS,
  TelemetryManager,
} from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { processBatch } from "./messagesHandler.js";
import {
  TelemetryWriteService,
  telemetryWriteServiceBuilder,
} from "./services/telemetryService.js";

const telemetryManager: TelemetryManager = initTelemetryManager(config);
const telemetryWriteService: TelemetryWriteService =
  telemetryWriteServiceBuilder(telemetryManager);

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  region: config.awsRegion,
  logLevel: config.logLevel,
});

await SQS.runBatchConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointTelemetryResultQueue,
    maxNumberOfMessages: config.maxNumberOfMessages,
    waitTimeSeconds: config.waitTimeSeconds,
    visibilityTimeout: config.visibilityTimeout,
    receiveMsgsCalls: config.receiveMsgsCalls,
    receiveMsgsConcurrency: config.receiveMsgsConcurrency,
    serviceName: config.applicationName,
  },
  processBatch(telemetryWriteService),
  logger({ serviceName: config.applicationName }),
).catch(genericLogger.error);
