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
import { clientBuilder, ClientHandler } from "./utilities/clientHandler.js";

const sqsClient: SQS.SQSClient = await SQS.instantiateClient(
  { region: config.awsRegion },
  config.applicationName
);
const clientHandler: ClientHandler = clientBuilder();
const callerService: CallerService = callerServiceBuilder(clientHandler);
const producerService: ProducerService = producerServiceBuilder(sqsClient);

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.sqsEndpointPollQueue,
    consumerPollingTimeout: config.consumerPollingTimeout,
  },
  processMessage(callerService, producerService)
).catch(logger.error);
