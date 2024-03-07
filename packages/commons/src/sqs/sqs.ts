import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
  SQSClientConfig,
} from "@aws-sdk/client-sqs";
import pkg from "aws-xray-sdk";
import { logger } from "../logging/index.js";
import { ConsumerConfig } from "../config/consumerConfig.js";

const { captureAWSv3Client, Segment } = pkg;

const serializeError = (error: unknown) => {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch (e) {
    return error;
  }
};

const processExit = async (exitStatusCode: number = 1): Promise<void> => {
  logger.error(`Process exit with code ${exitStatusCode}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(exitStatusCode);
};

export const instantiateClient = (
  config: SQSClientConfig,
  awsXraySegmentName: string
): SQSClient => {
  const sqsClient = new SQSClient({
    region: config.region,
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
      await deleteMessage(sqsClient, config.queueUrl, message.ReceiptHandle);
    }
  }
};

export const runConsumer = async (
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
        `Generic error occurs processing Queue: ${
          config.queueUrl
        }. Details: ${serializeError(e)}`
      );
      await processExit();
    }
  } while (true);
};

export const sendMessage = async (
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

export const deleteMessage = async (
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

export {
  SQSClient,
  SQSClientConfig,
  Message,
};