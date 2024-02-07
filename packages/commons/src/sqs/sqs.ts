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

const delay = (seconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

const processExit = async (existStatusCode: number = 1): Promise<void> => {
  logger.info(`Process exit with code ${existStatusCode}`);
  await delay(1);
  process.exit(existStatusCode);
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

const initConsumer = async (
  sqsClient: SQSClient,
  queueUrl: string,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  logger.info(`Consumer connecting to queue: ${queueUrl}`);

  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
  });

  const { Messages } = await sqsClient.send(command);

  logger.info(
    `Consumer successfully connected to and received messages from queue: ${queueUrl}`
  );

  if (Messages?.length) {
    for (const message of Messages) {
      if (!message.ReceiptHandle) {
        throw new Error(
          `ReceiptHandle not found in Message: ${JSON.stringify(message)}`
        );
      }

      await consumerHandler(message);
      await sqsDeleteMessage(sqsClient, queueUrl, message.ReceiptHandle);
    }
  }
};

export const sqsRunConsumer = async (
  sqsClient: SQSClient,
  config: { queueUrl: string } & ConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  do {
    try {
      await initConsumer(sqsClient, config.queueUrl, consumerHandler);
    } catch (e) {
      logger.error(
        `Generic error occurs during consumer process. Details: ${e}`
      );
      await processExit();
    } finally {
      await delay(config.defaultConsumerTimeout);
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
