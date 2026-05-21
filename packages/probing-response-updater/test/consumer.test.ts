import { describe, expect, it, vi, afterEach } from "vitest";
import { sqsMessages } from "./sqsMessages.js";
import { processBatch } from "../src/messagesHandler.js";
import {
  AppContext,
  decodeSQSMessage,
  decodeSQSMessageCorrelationId,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { v4 as uuidv4 } from "uuid";
import { config } from "../src/utilities/config.js";
import { UpdateResponseReceivedDto } from "pagopa-interop-probing-models";

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

    const decoded = decodeSQSMessage<UpdateResponseReceivedDto>(
      validMessage,
      UpdateResponseReceivedDto,
    );

    await expect(
      processBatch(mockResponseUpdaterService)([validMessage]),
    ).resolves.not.toThrow();

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).toHaveBeenCalledWith(
      decoded.eserviceRecordId,
      {
        status: decoded.status,
        responseReceived: decoded.responseReceived,
      },
      ctx,
    );
  });

  it("should throw decode error for invalid message object", async () => {
    const invalidMessage = {};

    await expect(
      processBatch(mockResponseUpdaterService)([invalidMessage as SQS.Message]),
    ).rejects.toMatchObject({
      code: "decodeSQSMessageError",
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
      processBatch(mockResponseUpdaterService)([emptyMessage]),
    ).rejects.toMatchObject({
      code: "decodeSQSMessageError",
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
      processBatch(mockResponseUpdaterService)([messageMissingId]),
    ).rejects.toMatchObject({
      code: "decodeSQSMessageError",
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
      processBatch(mockResponseUpdaterService)([messageMissingResponse]),
    ).rejects.toMatchObject({
      code: "decodeSQSMessageError",
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
      processBatch(mockResponseUpdaterService)([messageMissingStatus]),
    ).rejects.toMatchObject({
      code: "decodeSQSMessageError",
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
      processBatch(mockResponseUpdaterService)([badFormattedMessage]),
    ).rejects.toMatchObject({
      code: "decodeSQSMessageError",
    });

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).not.toHaveBeenCalled();
  });
});
