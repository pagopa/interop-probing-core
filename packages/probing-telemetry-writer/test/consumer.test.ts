import { describe, expect, it, vi, afterEach } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import {
  AppContext,
  decodeSQSMessageCorrelationId,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import {
  ApplicationError,
  TelemetryKoDto,
  responseStatus,
} from "pagopa-interop-probing-models";
import { v4 as uuidv4 } from "uuid";
import { ErrorCodes } from "../src/model/domain/errors.js";
import { config } from "../src/utilities/config.js";

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

    const { correlationId } = decodeSQSMessageCorrelationId(validMessage);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: validMessage.MessageId,
      correlationId,
    };

    await expect(
      processMessage(mockTelemetryService)(validMessage),
    ).resolves.not.toThrowError();

    expect(mockTelemetryService.writeRecord).toHaveBeenCalledWith(
      decodeSQSMessage(validMessage),
      ctx,
    );
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(mockTelemetryService)(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
    }
  });
});
