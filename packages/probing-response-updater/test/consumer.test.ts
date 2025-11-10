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
import { ApplicationError } from "pagopa-interop-probing-models";
import { v4 as uuidv4 } from "uuid";
import { config } from "../src/utilities/config.js";
import { ErrorCodes } from "../src/model/domain/errors.js";

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

  it("given valid message, method should not throw an exception", async () => {
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
    ).resolves.not.toThrowError();

    expect(
      mockResponseUpdaterService.updateResponseReceived,
    ).toHaveBeenCalledWith(decodeSQSMessage(validMessage), ctx);
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(mockResponseUpdaterService)(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
    }
  });

  it("given empty message, method should throw an error", async () => {
    const emptyMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedEmpty),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockResponseUpdaterService)(emptyMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
      expect(
        mockResponseUpdaterService.updateResponseReceived,
      ).not.toBeCalled();
    }
  });

  it("when eserviceRecordId field is missing, method should throw an error", async () => {
    const missingEserviceRecordId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(
        sqsMessages.messageChangeResponseReceivedNoEserviceRecordId,
      ),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockResponseUpdaterService)(missingEserviceRecordId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
      expect(
        mockResponseUpdaterService.updateResponseReceived,
      ).not.toBeCalled();
    }
  });

  it("when responseReceived is missing, method should throw an error", async () => {
    const missingResponseReceived: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(
        sqsMessages.messageChangeResponseReceivedNoResponseReceived,
      ),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockResponseUpdaterService)(missingResponseReceived);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
      expect(
        mockResponseUpdaterService.updateResponseReceived,
      ).not.toBeCalled();
    }
  });

  it("when status is missing, method should throw an error", async () => {
    const missingStatus: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedNoStatus),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockResponseUpdaterService)(missingStatus);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
      expect(
        mockResponseUpdaterService.updateResponseReceived,
      ).not.toBeCalled();
    }
  });

  it("when responseReceived is bad formatted, method should throw an error", async () => {
    const badFormattedResponseReceived: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageBadFormattedResponseReceived),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockResponseUpdaterService)(
        badFormattedResponseReceived,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
    }
  });
});
