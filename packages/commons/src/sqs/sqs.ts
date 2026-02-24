import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
  SQSClientConfig,
  SendMessageCommandInput,
  DeleteMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import { genericLogger, Logger } from "../logging/index.js";
import { ConsumerConfig } from "../config/consumerConfig.js";
import { match } from "ts-pattern";
import { validateSqsMessage } from "./sqsMessageValidation.js";
import { InternalError } from "pagopa-interop-probing-models";
import { LoggerConfig } from "../config/loggerConfig.js";
import pLimit from "p-limit";

const serializeError = (error: unknown): string => {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch (e) {
    return `${error} - ${e}`;
  }
};

const processExit = async (exitStatusCode: number = 1): Promise<void> => {
  genericLogger.error(`Process exit with code ${exitStatusCode}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(exitStatusCode);
};

export const instantiateClient = (
  config: LoggerConfig & Partial<SQSClientConfig>,
): SQSClient => {
  const sqsClient = new SQSClient({
    logger: config.logLevel === "debug" ? console : undefined,
    ...config,
  });
  return sqsClient;
};

const processQueue = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & ConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>,
  loggerInstance: Logger,
): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: config.queueUrl,
    MessageAttributeNames: ["All"],
    WaitTimeSeconds: config.waitTimeSeconds,
    MaxNumberOfMessages: config.maxNumberOfMessages,
    VisibilityTimeout: config.visibilityTimeout,
  });

  let keepProcessingQueue: boolean = true;

  do {
    const { Messages } = await sqsClient.send(command);
    if (config.runUntilQueueIsEmpty && (!Messages || Messages?.length === 0)) {
      keepProcessingQueue = false;
    }

    if (Messages?.length) {
      for (const message of Messages) {
        try {
          const receiptHandle = message.ReceiptHandle;
          if (!receiptHandle) {
            throw new Error(
              `ReceiptHandle not found in Message: ${JSON.stringify(message)}`,
            );
          }

          const validationResult = validateSqsMessage(message, loggerInstance);
          await match(validationResult)
            .with("InvalidEvent", async () => {
              await deleteMessage(sqsClient, config.queueUrl, receiptHandle);
            })
            .with("ValidEvent", async () => {
              await consumerHandler(message);
              await deleteMessage(sqsClient, config.queueUrl, receiptHandle);
            })
            .exhaustive();
        } catch (e) {
          loggerInstance.error(
            `Unexpected error consuming message: ${JSON.stringify(
              message,
            )}. QueueUrl: ${config.queueUrl}. ${e}`,
          );
          if (!(e instanceof InternalError)) throw e;
        }
      }
    }
  } while (keepProcessingQueue);
};

export const runConsumer = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & ConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>,
  loggerInstance: Logger,
): Promise<void> => {
  loggerInstance.info(`Consumer processing on Queue: ${config.queueUrl}`);

  try {
    await processQueue(sqsClient, config, consumerHandler, loggerInstance);
  } catch (e) {
    loggerInstance.error(
      `Generic error occurs processing Queue: ${
        config.queueUrl
      }. Details: ${serializeError(e)}`,
    );
    await processExit();
  }

  loggerInstance.info(
    `Queue processing Completed for Queue: ${config.queueUrl}`,
  );
};

export const sendMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messageBody: string,
  correlationId: string,
  messageGroupId?: string | null,
): Promise<void> => {
  const messageCommandInput: SendMessageCommandInput = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };

  if (messageGroupId) {
    messageCommandInput.MessageGroupId = messageGroupId;
  }

  messageCommandInput.MessageAttributes = {
    correlationId: {
      DataType: "String",
      StringValue: correlationId,
    },
  };

  const command = new SendMessageCommand(messageCommandInput);

  await sqsClient.send(command);
};

export const deleteMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  receiptHandle: string,
): Promise<void> => {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(deleteCommand);
};

export const runBatchConsumer = async (
  sqsClient: SQSClient,
  config: { serviceName: string; queueUrl: string } & ConsumerConfig,
  consumerBatchHandler: (messages: Message[]) => Promise<void>,
  loggerInstance: Logger,
): Promise<void> => {
  loggerInstance.info(`Batch consumer processing on Queue: ${config.queueUrl}`);

  try {
    await processBatchQueue(
      sqsClient,
      config,
      consumerBatchHandler,
      loggerInstance,
    );
  } catch (e) {
    loggerInstance.error(
      `Generic error occurs processing Batch Queue: ${
        config.queueUrl
      }. Details: ${serializeError(e)}`,
    );
    await processExit();
  }

  loggerInstance.info(
    `Queue processing Completed for Queue: ${config.queueUrl}`,
  );
};

const processBatchQueue = async (
  sqsClient: SQSClient,
  config: { queueUrl: string } & ConsumerConfig,
  consumerBatchHandler: (messages: Message[]) => Promise<void>,
  loggerInstance: Logger,
): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: config.queueUrl,
    MaxNumberOfMessages: config.maxNumberOfMessages,
    MessageAttributeNames: ["All"],
    WaitTimeSeconds: config.waitTimeSeconds,
    VisibilityTimeout: config.visibilityTimeout,
  });
  const concurrencyLimit = pLimit(config.receiveMsgsConcurrency);

  do {
    const receiveMessagesStartTime = Date.now();
    const receiveMessagesPromises = Array.from(
      { length: config.receiveMsgsCalls },
      () => concurrencyLimit(() => sqsClient.send(command)),
    );
    const receiveMessagesresults = await Promise.all(receiveMessagesPromises);

    const Messages = receiveMessagesresults.flatMap((r) => r.Messages ?? []);
    if (Messages?.length) {
      const processMessageStartTime = Date.now();
      loggerInstance.debug(
        `Receive Batch Messages with receiveMsgsCalls ${config.receiveMsgsCalls}`,
        receiveMessagesStartTime,
      );

      const validMessages: Message[] = [];
      const invalidMessages: Message[] = [];
      for (const message of Messages) {
        const result = validateSqsMessage(message, loggerInstance);
        await match(result)
          .with("InvalidEvent", async () => {
            invalidMessages.push(message);
          })
          .with("ValidEvent", async () => {
            validMessages.push(message);
          })
          .exhaustive();
      }

      if (invalidMessages.length) {
        await deleteBatchMessages(sqsClient, config.queueUrl, invalidMessages);
        loggerInstance.debug(
          `[END] Delete Batch Invalid Messages`,
          processMessageStartTime,
        );
      }

      if (validMessages.length) {
        try {
          await consumerBatchHandler(validMessages);
          loggerInstance.debug(
            `[END] Process Batch Messages`,
            processMessageStartTime,
          );
          const deleteMessageStartTime = Date.now();
          await deleteBatchMessages(sqsClient, config.queueUrl, validMessages);
          loggerInstance.debug(
            `[END] Delete Batch Messages`,
            deleteMessageStartTime,
          );
        } catch (batchError) {
          loggerInstance.error(
            `Error processing Batch Messages: ${serializeError(batchError)}`,
          );
        } finally {
          loggerInstance.debug(
            `[END] Consuming Batch Messages ${JSON.stringify(
              Messages.map(({ MessageId }) => MessageId),
            )}`,
            processMessageStartTime,
          );
        }
      }
    }
  } while (true);
};

export const deleteBatchMessages = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messages: Message[],
): Promise<void> => {
  const entries = messages
    .filter((msg) => msg.ReceiptHandle)
    .map((msg, index) => ({
      Id: `${index}`,
      ReceiptHandle: msg.ReceiptHandle!,
    }));

  if (entries.length === 0) {
    return;
  }

  // eslint-disable-next-line functional/no-let
  let index = 0;

  do {
    const deleteBatch = entries.slice(index, index + 10);

    await sqsClient.send(
      new DeleteMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: deleteBatch,
      }),
    );

    index += 10;
  } while (index < entries.length);
};

export { SQSClient, SQSClientConfig, Message };
