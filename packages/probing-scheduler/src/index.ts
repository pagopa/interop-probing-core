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
import { genericLogger } from "pagopa-interop-probing-commons";

const sqsClient: SQS.SQSClient = await SQS.instantiateClient({
  region: config.awsRegion,
  logLevel: config.logLevel,
});
const operationsApiClient = createApiClient(config.operationsBaseUrl);
const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);
const producerService: ProducerService = producerServiceBuilder(sqsClient);

let isRunning = false;

genericLogger.info(
  `Scheduler started with cron expression: ${config.schedulerCronExpression}`,
);

cron
  .schedule(
    config.schedulerCronExpression,
    async () => {
      try {
        if (isRunning) {
          genericLogger.info("Previous run still in progress. Skipping.");
          return;
        }
        isRunning = true;
        await processTask(operationsService, producerService);
      } finally {
        isRunning = false;
      }
    },
    { scheduled: true },
  )
  .start();
