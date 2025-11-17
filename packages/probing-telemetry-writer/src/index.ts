import {
  initTelemetryManager,
  logger,
  SQS,
  TelemetryManager,
} from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { processMessage } from "./messagesHandler.js";
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

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointTelemetryResultQueue,
    maxNumberOfMessages: config.maxNumberOfMessages,
    waitTimeSeconds: config.waitTimeSeconds,
    visibilityTimeout: config.visibilityTimeout,
  },
  processMessage(telemetryWriteService),
  logger({ serviceName: config.applicationName }),
);
