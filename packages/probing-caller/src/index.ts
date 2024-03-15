import { logger, SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { processMessage } from "./messagesHandler.js";
import {
  CallerService,
  callerServiceBuilder,
} from "./services/callerService.js";
import {
  ProducerService,
  producerServiceBuilder,
} from "./services/producerService.js";
import { apiClientBuilder, ApiClientHandler } from "./utilities/apiClientHandler.js";
import { kmsClientBuilder, KMSClientHandler } from "./utilities/kmsClientHandler.js";

const sqsClient: SQS.SQSClient = await SQS.instantiateClient(
  { region: config.awsRegion },
  config.applicationName
);
const kmsClientHandler: KMSClientHandler = kmsClientBuilder();
const apiClientHandler: ApiClientHandler = apiClientBuilder();
const callerService: CallerService = callerServiceBuilder(apiClientHandler, kmsClientHandler);
const producerService: ProducerService = producerServiceBuilder(sqsClient);

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollQueue,
    consumerPollingTimeout: config.consumerPollingTimeout,
  },
  processMessage(callerService, producerService)
).catch(logger.error);
