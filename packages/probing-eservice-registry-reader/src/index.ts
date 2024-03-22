import { SQS } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import {
  BucketService,
  bucketServiceBuilder,
} from "./services/bucketService.js";
import {
  ProducerService,
  producerServiceBuilder,
} from "./services/producerService.js";
import { S3Client } from "@aws-sdk/client-s3";
import { processTask } from "./processTask.js";

const sqsClient: SQS.SQSClient = SQS.instantiateClient(
  { region: config.awsRegion },
  config.applicationName
);
const s3client: S3Client = new S3Client({ region: config.awsRegion });

const bucketService: BucketService = bucketServiceBuilder(s3client);
const producerService: ProducerService = producerServiceBuilder(sqsClient);

processTask(bucketService, producerService);
