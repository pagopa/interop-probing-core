import { startServer } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApp } from "./app.js";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
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

startServer(createApp(operationsService), config);
