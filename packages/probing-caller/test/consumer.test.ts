import { describe, expect, it, vi, afterAll } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import { AppError } from "../src/model/domain/errors.js";
import { SQS } from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import { callerConstants } from "../src/utilities/constants.js";
import { responseStatus, TelemetryDto } from "pagopa-interop-probing-models";

describe("Consumer queue test", async () => {
  const telemetryResult: TelemetryDto = {
    eserviceRecordId: 1,
    checkTime: Date.now().toString(),
    status: responseStatus.ko,
    koReason: callerConstants.CONNECTION_REFUSED_KO_REASON,
    responseTime: 16,
  };

  const mockProbingCallerService = {
    performRequest: vi.fn().mockResolvedValue(telemetryResult),
  };

  const mockProducerService = {
    sendToTelemetryWriterQueue: vi.fn().mockResolvedValue(undefined),
    sendToResponseUpdaterQueue: vi.fn().mockResolvedValue(undefined),
  };

  afterAll(() => {
    vi.restoreAllMocks();
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
    };

    await expect(async () => {
      await processMessage(
        mockProbingCallerService,
        mockProducerService
      )(validMessage);

      await expect(
        mockProbingCallerService.performRequest
      ).toHaveBeenCalledWith(decodeSQSMessage(validMessage));

      await expect(
        mockProducerService.sendToTelemetryWriterQueue
      ).toHaveBeenCalledWith(telemetryResult);

      await expect(
        mockProducerService.sendToResponseUpdaterQueue
      ).toHaveBeenCalled();
    }).not.toThrowError();
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(
        mockProbingCallerService,
        mockProducerService
      )(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });
});
