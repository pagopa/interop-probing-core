import { SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { processMessage } from "./messagesHandler.js";
import {
  TelemetryWriteService,
  telemetryWriteServiceBuilder,
} from "./services/telemetryService.js";
import {
  TimestreamWriteClientHandler,
  timestreamWriteClientBuilder,
} from "./utilities/timestreamWriteClientHandler.js";

const timestreamWriteClient: TimestreamWriteClientHandler =
  timestreamWriteClientBuilder();
const telemetryService: TelemetryWriteService = telemetryWriteServiceBuilder(
  timestreamWriteClient
);

const sqsClient: SQS.SQSClient = await SQS.instantiateClient(
  { region: config.awsRegion },
  config.applicationName
);

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointTelemetryResultQueue,
    consumerPollingTimeout: config.consumerPollingTimeout,
  },
  processMessage(telemetryService)
);
