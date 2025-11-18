import { describe, expect, it, vi, afterEach } from "vitest";
import { sqsMessages } from "./sqsMessages.js";
import { processMessage } from "../src/messagesHandler.js";
import {
  AppContext,
  decodeSQSMessageCorrelationId,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import { v4 as uuidv4 } from "uuid";
import { config } from "../src/utilities/config.js";

describe("Consumer queue test", () => {
  const mockResponseUpdaterService = {
    updateResponseReceived: vi.fn().mockResolvedValue(undefined),
  };

  const correlationIdMessageAttribute = {
    correlationId: {
      DataType: "String",
      StringValue: uuidv4(),
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should process a valid message without throwing", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedDto),
      MessageAttributes: correlationIdMessageAttribute,
    };

    const { correlationId } = decodeSQSMessageCorrelationId(validMessage);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: validMessage.MessageId,
      correlationId,
    };

    await expect(
      processMessage(mockResponseUpdaterService)(validMessage),
    ).resolves.not.toThrow();

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).toHaveBeenCalledWith(decodeSQSMessage(validMessage), ctx);
  });

  it("should throw decode error for invalid message object", async () => {
    const invalidMessage = {};

    await expect(
      processMessage(mockResponseUpdaterService)(invalidMessage),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
    });
  });

  it("should throw decode error for empty message body", async () => {
    const emptyMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedEmpty),
      MessageAttributes: correlationIdMessageAttribute,
    };

    await expect(
      processMessage(mockResponseUpdaterService)(emptyMessage),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
    });

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).not.toHaveBeenCalled();
  });

  it("should throw decode error when eserviceRecordId is missing", async () => {
    const messageMissingId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(
        sqsMessages.messageChangeResponseReceivedNoEserviceRecordId,
      ),
      MessageAttributes: correlationIdMessageAttribute,
    };

    await expect(
      processMessage(mockResponseUpdaterService)(messageMissingId),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
    });

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).not.toHaveBeenCalled();
  });

  it("should throw decode error when responseReceived is missing", async () => {
    const messageMissingResponse: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(
        sqsMessages.messageChangeResponseReceivedNoResponseReceived,
      ),
      MessageAttributes: correlationIdMessageAttribute,
    };

    await expect(
      processMessage(mockResponseUpdaterService)(messageMissingResponse),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
    });

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).not.toHaveBeenCalled();
  });

  it("should throw decode error when status is missing", async () => {
    const messageMissingStatus: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedNoStatus),
      MessageAttributes: correlationIdMessageAttribute,
    };

    await expect(
      processMessage(mockResponseUpdaterService)(messageMissingStatus),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
    });

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).not.toHaveBeenCalled();
  });

  it("should throw decode error when responseReceived has invalid format", async () => {
    const badFormattedMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageBadFormattedResponseReceived),
      MessageAttributes: correlationIdMessageAttribute,
    };

    await expect(
      processMessage(mockResponseUpdaterService)(badFormattedMessage),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
    });

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).not.toHaveBeenCalled();
  });
});
