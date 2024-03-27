import { SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import {
  OperationsService,
  operationsServiceBuilder,
} from "./services/operationsService.js";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import { processTask } from "./processTask.js";
import {
  ProducerService,
  producerServiceBuilder,
} from "./services/producerService.js";
import cron from "node-cron";

const sqsClient: SQS.SQSClient = await SQS.instantiateClient(
  { region: config.awsRegion },
  config.applicationName,
);
const operationsApiClient = createApiClient(config.operationsBaseUrl);
const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);
const producerService: ProducerService = producerServiceBuilder(sqsClient);

cron
  .schedule(
    config.schedulerCronExpression,
    () => processTask(operationsService, producerService),
    {
      scheduled: true,
    },
  )
  .start();
