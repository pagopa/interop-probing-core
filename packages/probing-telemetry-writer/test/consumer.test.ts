import { describe, expect, it, vi, afterAll } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import { AppError } from "../src/model/domain/errors.js";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import { TelemetryKoDto, responseStatus } from "pagopa-interop-probing-models";

describe("Consumer queue test", () => {
  const mockTelemetryService = {
    writeRecord: vi.fn().mockResolvedValue(undefined),
  };

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("given valid message, method should not throw an exception", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceRecordId: 1,
        checkTime: Date.now().toString(),
        status: responseStatus.ko,
        koReason: "Connection refused",
        responseTime: 16,
      } as TelemetryKoDto),
    };

    await expect(async () => {
      await processMessage(mockTelemetryService)(validMessage);
    }).not.toThrowError();

    expect(mockTelemetryService.writeRecord).toHaveBeenCalledWith(
      decodeSQSMessage(validMessage),
    );
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(mockTelemetryService)(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0001");
    }
  });
});
