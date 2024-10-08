import { describe, expect, it, vi, afterAll } from "vitest";
import { processMessage } from "../src/messagesHandler.js";
import {
  AppContext,
  decodeSQSMessageCorrelationId,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { decodeSQSMessageBody } from "../src/model/models.js";
import { v4 as uuidv4 } from "uuid";
import {
  ApplicationError,
  eserviceInteropState,
  technology,
} from "pagopa-interop-probing-models";
import { config } from "../src/utilities/config.js";
import { ErrorCodes } from "../src/model/domain/errors.js";

describe("Consumer queue test", () => {
  const mockOperationsService = {
    saveEservice: vi.fn().mockResolvedValue(undefined),
  };

  const correlationIdMessageAttribute = {
    correlationId: {
      DataType: "String",
      StringValue: uuidv4(),
    },
  };

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("given valid message, method should not throw an exception", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceId: uuidv4(),
        versionId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      }),
      MessageAttributes: correlationIdMessageAttribute,
    };

    const { correlationId } = decodeSQSMessageCorrelationId(validMessage);
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: validMessage.MessageId,
      correlationId,
    };

    expect(
      processMessage(mockOperationsService)(validMessage),
    ).resolves.not.toThrow();

    expect(mockOperationsService.saveEservice).toHaveBeenCalledWith(
      decodeSQSMessageBody(validMessage),
      ctx,
    );
  });

  it("given invalid message, method should throw an error", async () => {
    const invalidMessage = {};

    try {
      await processMessage(mockOperationsService)(invalidMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0002");
    }
  });

  it("when eserviceId field is missing, method should throw an error", async () => {
    const missingEserviceId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        versionId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      }),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockOperationsService)(missingEserviceId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0002");
      expect(mockOperationsService.saveEservice).not.toBeCalled();
    }
  });

  it("when versionId field is missing, method should throw an error", async () => {
    const missingVersionId: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: 1,
      }),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockOperationsService)(missingVersionId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0002");
      expect(mockOperationsService.saveEservice).not.toBeCalled();
    }
  });

  it("when eserviceDTO message is bad formatted, method should throw an error", async () => {
    const badFormattedEserviceDTO: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceId: uuidv4(),
        versionId: uuidv4(),
        name: "Service Name",
        producerName: "Producer Name",
        state: eserviceInteropState.active,
        technology: technology.rest,
        basePath: ["basePath1", "basePath2"],
        audience: ["audience1", "audience2"],
        versionNumber: "1",
      }),
      MessageAttributes: correlationIdMessageAttribute,
    };

    try {
      await processMessage(mockOperationsService)(badFormattedEserviceDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0002");
    }
  });
});
