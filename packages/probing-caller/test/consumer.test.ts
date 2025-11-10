import { describe, expect, it, vi, afterAll, afterEach } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import {
  AppContext,
  decodeSQSMessageCorrelationId,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import { callerConstants } from "../src/utilities/constants.js";
import {
  ApplicationError,
  responseStatus,
  TelemetryDto,
} from "pagopa-interop-probing-models";
import { config } from "../src/utilities/config.js";
import { v4 as uuidv4 } from "uuid";
import { ErrorCodes } from "../src/model/domain/errors.js";

describe("Consumer queue test", async () => {
  const telemetryResult: TelemetryDto = {
    eserviceRecordId: 1,
    checkTime: Date.now().toString(),
    status: responseStatus.ko,
    koReason: callerConstants.CONNECTION_REFUSED_KO_REASON,
    responseTime: 16,
  };

  const correlationIdMessageAttribute = {
    correlationId: {
      DataType: "String",
      StringValue: uuidv4(),
    },
  };

  const mockProbingCallerService = {
    performRequest: vi.fn().mockResolvedValue(telemetryResult),
  };

  const mockProducerService = {
    sendToTelemetryWriterQueue: vi.fn().mockResolvedValue(undefined),
    sendToResponseUpdaterQueue: vi.fn().mockResolvedValue(undefined),
  };

  afterEach(() => vi.restoreAllMocks());

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("Reads the message from the queue and pushes it to the polling and telemetry queues.", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceRecordId: 1,
        technology: "REST",
        basePath: ["path1", "path2"],
        audience: ["aud1", "path2"],
      }),
      MessageAttributes: correlationIdMessageAttribute,
    };

    const { correlationId } = decodeSQSMessageCorrelationId(validMessage);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: validMessage.MessageId,
      correlationId,
    };

    await expect(
      processMessage(
        mockProbingCallerService,
        mockProducerService,
      )(validMessage),
    ).resolves.not.toThrowError();

    expect(mockProbingCallerService.performRequest).toHaveBeenCalledWith(
      decodeSQSMessage(validMessage),
      ctx,
    );

    expect(mockProducerService.sendToTelemetryWriterQueue).toHaveBeenCalledWith(
      telemetryResult,
      ctx,
    );

    expect(mockProducerService.sendToResponseUpdaterQueue).toHaveBeenCalled();
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(
        mockProbingCallerService,
        mockProducerService,
      )(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe(
        "DECODE_SQS_MESSAGE_ERROR",
      );
    }
  });
});
