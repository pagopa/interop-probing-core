import { describe, expect, it, vi, afterAll } from "vitest";
import { sqsMessages } from "./sqsMessages.js";
import { processMessage } from "../src/messagesHandler.js";
import { AppError } from "../src/model/domain/errors.js";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";

describe("Consumer queue test", () => {
  const mockResponseUpdaterService = {
    updateResponseReceived: vi.fn().mockResolvedValue(undefined),
  };

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("given valid message, method should not throw an exception", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedDto),
    };

    await expect(async () => {
      await processMessage(mockResponseUpdaterService)(validMessage);
    }).not.toThrowError();

    expect(
      mockResponseUpdaterService.updateResponseReceived
    ).toHaveBeenCalledWith(decodeSQSMessage(validMessage));
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(mockResponseUpdaterService)(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });

  it("given empty message, method should throw an error", async () => {
    const emptyMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedEmpty),
    };

    try {
      await processMessage(mockResponseUpdaterService)(emptyMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect(
        mockResponseUpdaterService.updateResponseReceived
      ).not.toBeCalled();
    }
  });

  it("when eserviceRecordId field is missing, method should throw an error", async () => {
    const missingEserviceRecordId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(
        sqsMessages.messageChangeResponseReceivedNoEserviceRecordId
      ),
    };

    try {
      await processMessage(mockResponseUpdaterService)(missingEserviceRecordId);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect(
        mockResponseUpdaterService.updateResponseReceived
      ).not.toBeCalled();
    }
  });

  it("when responseReceived is missing, method should throw an error", async () => {
    const missingResponseReceived: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(
        sqsMessages.messageChangeResponseReceivedNoResponseReceived
      ),
    };

    try {
      await processMessage(mockResponseUpdaterService)(missingResponseReceived);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect(
        mockResponseUpdaterService.updateResponseReceived
      ).not.toBeCalled();
    }
  });

  it("when status is missing, method should throw an error", async () => {
    const missingStatus: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedNoStatus),
    };

    try {
      await processMessage(mockResponseUpdaterService)(missingStatus);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect(
        mockResponseUpdaterService.updateResponseReceived
      ).not.toBeCalled();
    }
  });

  it("when responseReceived is bad formatted, method should throw an error", async () => {
    const badFormattedResponseReceived: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageBadFormattedResponseReceived),
    };

    try {
      await processMessage(mockResponseUpdaterService)(
        badFormattedResponseReceived
      );
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });
});
