import { startServer } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApp } from "./app.js";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "./services/operationsService.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);
const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);

startServer(createApp(operationsService), config);
