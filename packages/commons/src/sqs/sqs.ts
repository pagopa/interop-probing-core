import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import pkg from "aws-xray-sdk";

interface SQSConfig {
  awsRegion: string;
}

const { captureAWSv3Client, Segment } = pkg;

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
    MaxNumberOfMessages: 10,
  });

  const { Messages } = await sqsClient.send(command);
  if (Messages?.length) {
    try {
      for (const message of Messages) {
        if (!message.ReceiptHandle) {
          throw new Error(
            `ReceiptHandle not found in Message: ${JSON.stringify(message)}`
          );
        }

        await consumerHandler(message);
        await sqsDeleteMessage(sqsClient, queueUrl, message.ReceiptHandle);
      }
    } catch (e) {
      throw new Error(`Unexpected error on Consumer queue: ${e}`);
    }
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
  receiptHandle: string
): Promise<void> => {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(deleteCommand);
};
