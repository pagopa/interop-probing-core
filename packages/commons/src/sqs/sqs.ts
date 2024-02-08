import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import pkg from "aws-xray-sdk";
import { logger } from "../logging/index.js";
import { ConsumerConfig } from "../index.js";

interface SQSConfig {
  awsRegion: string;
}

const { captureAWSv3Client, Segment } = pkg;

const processExit = async (exitStatusCode: number = 1): Promise<void> => {
  logger.info(`Process exit with code ${exitStatusCode}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(exitStatusCode);
};

export const instantiateSQSClient = (
  config: SQSConfig,
  awsXraySegmentName: string
): SQSClient => {
  const sqsClient = new SQSClient({
    region: config.awsRegion,
  });
  captureAWSv3Client(sqsClient, new Segment(awsXraySegmentName));

  return sqsClient;
};

const processQueue = async (
  sqsClient: SQSClient,
  config: { queueUrl: string } & ConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: config.queueUrl,
    WaitTimeSeconds: config.consumerPollingTimeout,
    MaxNumberOfMessages: 10,
  });

  const { Messages } = await sqsClient.send(command);
  if (Messages?.length) {
    for (const message of Messages) {
      if (!message.ReceiptHandle) {
        throw new Error(
          `ReceiptHandle not found in Message: ${JSON.stringify(message)}`
        );
      }

      await consumerHandler(message);
      await sqsDeleteMessage(sqsClient, config.queueUrl, message.ReceiptHandle);
    }
  }
};

export const sqsRunConsumer = async (
  sqsClient: SQSClient,
  config: { queueUrl: string } & ConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  logger.info(`Consumer processing on Queue: ${config.queueUrl}`);

  do {
    try {
      await processQueue(sqsClient, config, consumerHandler);
    } catch (e) {
      logger.error(
        `Generic error occurs processing Queue: ${config.queueUrl}. Details: ${e}`
      );
      await processExit();
    }
  } while (true);
};

export const sqsSendMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messageBody: string
): Promise<void> => {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  });

  await sqsClient.send(command);
};

export const sqsDeleteMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  receiptHandle: string
): Promise<void> => {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(deleteCommand);
};
