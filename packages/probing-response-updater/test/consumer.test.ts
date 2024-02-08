import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { sqsMessages } from "./sqsMessages.js";
import { processMessage } from "../src/messagesHandler.js";
import { AppError } from "../src/model/domain/errors.js";
import { api } from "../../probing-eservice-operations/src/model/generated/api.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "../src/services/eserviceService.js";
import { SQS } from "pagopa-interop-probing-commons";

describe("Consumer queue test", () => {
  let eserviceService: EserviceService;

  const mockEserviceService = {
    updateResponseReceived: vi.fn().mockResolvedValue(undefined),
  };

  const executeProcessMessage = async (message: SQS.Message) =>
    (await processMessage(eserviceService))(message);

  beforeAll(async () => {
    eserviceService = eServiceServiceBuilder(api);
  });

  afterEach(() => {
    eserviceService = eServiceServiceBuilder(api);
  });

  it("given valid message, method should not throw an exception", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedDto),
    };

    eserviceService = mockEserviceService;

    try {
      await executeProcessMessage(validMessage);
    } catch (error) {
      expect(error).not.toBeInstanceOf(AppError);
    }
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await executeProcessMessage(invalidMessage);
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
      await executeProcessMessage(emptyMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
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
      await executeProcessMessage(missingEserviceRecordId);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
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
      await executeProcessMessage(missingResponseReceived);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });

  it("when status is missing, method should throw an error", async () => {
    const missingStatus: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageChangeResponseReceivedNoStatus),
    };

    try {
      await executeProcessMessage(missingStatus);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });

  it("when responseReceived is bad formatted, method should throw an error", async () => {
    const badFormattedResponseReceived: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify(sqsMessages.messageBadFormattedResponseReceived),
    };

    try {
      await executeProcessMessage(badFormattedResponseReceived);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0003");
    }
  });
});
