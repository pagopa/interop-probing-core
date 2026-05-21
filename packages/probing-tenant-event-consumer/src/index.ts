import { runConsumer } from "kafka-connector";
import { config } from "./utilities/config.js";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import {
  OperationsService,
  operationsServiceBuilder,
} from "./services/operationsService.js";
import { processMessage } from "./messagesHandler.js";

const operationsApiClient = probingEserviceOperationsApi.createTenantsApiClient(
  config.operationsBaseUrl,
);
const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);

await runConsumer(
  config,
  [config.kafkaTopic],
  processMessage(operationsService),
);
