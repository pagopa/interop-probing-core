import { runConsumer } from "kafka-connector";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import { config } from "./utilities/config.js";
import {
  operationsServiceBuilder,
  OperationsService,
} from "./services/operationService.js";
import { processMessage } from "./messagesHandler.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);
const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);

await runConsumer(
  config,
  [config.kafkaTopic],
  processMessage(operationsService),
);
