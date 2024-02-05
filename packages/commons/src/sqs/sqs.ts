import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import { captureAWSv3Client, Segment } from "aws-xray-sdk";

export interface SQSConfig {
  awsRegion: string;
}

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

export const sqsRunConsumer = async (
  sqsClient: SQSClient,
  queueUrl: string,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
  });

  const { Messages } = await sqsClient.send(command);
  if (Messages?.length) {
    try {
      const [message] = Messages;
      await consumerHandler(message);
      await sqsDeleteMessage(sqsClient, queueUrl, message.ReceiptHandle);
    } catch (e) {
      throw new Error(`Unexpected error on consumer queue: ${e}`);
    }
  } else {
    throw new Error("No messages found in the queue");
  }
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
  receiptHandle: string | undefined
): Promise<void> => {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(deleteCommand);
};
