import { describe, expect, it, vi, afterEach } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import { SQS } from "pagopa-interop-probing-commons";
import { TelemetryKoDto, responseStatus } from "pagopa-interop-probing-models";
import { v4 as uuidv4 } from "uuid";

describe("Consumer queue test", () => {
  const mockTelemetryService = {
    writeRecord: vi.fn().mockResolvedValue(undefined),
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
      Body: JSON.stringify({
        eserviceRecordId: 1,
        checkTime: Date.now().toString(),
        status: responseStatus.ko,
        koReason: "Connection refused",
        responseTime: 16,
      } as TelemetryKoDto),
      MessageAttributes: correlationIdMessageAttribute,
    };

    await expect(
      processMessage(mockTelemetryService)(validMessage),
    ).resolves.not.toThrow();
  });

  it("given invalid message, method should throw a decode error", async () => {
    const invalidMessage = {};

    await expect(
      processMessage(mockTelemetryService)(invalidMessage),
    ).rejects.toMatchObject({
      code: "DECODE_SQS_MESSAGE_ERROR",
      detail: expect.any(String),
    });
  });
});
