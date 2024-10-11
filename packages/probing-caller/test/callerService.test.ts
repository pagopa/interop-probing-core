import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CallerService,
  callerServiceBuilder,
} from "../src/services/callerService.js";
import {
  AppContext,
  decodeSQSMessageCorrelationId,
  genericLogger,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { decodeSQSMessage } from "../src/model/models.js";
import {
  ApiClientHandler,
  apiClientBuilder,
} from "../src/utilities/apiClientHandler.js";
import { callerConstants } from "../src/utilities/constants.js";
import { mockApiClientError, mockApiClientResponse } from "./utils.js";
import {
  KMSClientHandler,
  kmsClientBuilder,
} from "../src/utilities/kmsClientHandler.js";
import {
  buildJWTError,
  ErrorCodes,
  makeApplicationError,
} from "../src/model/domain/errors.js";
import {
  ApplicationError,
  EserviceContentDto,
  TelemetryKoDto,
} from "pagopa-interop-probing-models";
import { config } from "../src/utilities/config.js";
import { v4 as uuidv4 } from "uuid";

describe("caller service test", () => {
  const mockJWT = `token`;
  const kmsClientHandler: KMSClientHandler = kmsClientBuilder();
  const apiClientHandler: ApiClientHandler = apiClientBuilder();
  const callerService: CallerService = callerServiceBuilder(
    apiClientHandler,
    kmsClientHandler,
  );

  const correlationIdMessageAttribute = {
    correlationId: {
      DataType: "String",
      StringValue: uuidv4(),
    },
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Test KO CONNECTION_REFUSED call probing - REST", async () => {
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

    const apiClientError = mockApiClientError(
      500,
      "connect ECONNREFUSED ::1:80",
      "ECONNREFUSED",
    );

    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);
    vi.spyOn(apiClientHandler, "sendREST").mockRejectedValue(apiClientError);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(kmsClientHandler.buildJWT).toHaveBeenCalledWith(eservice.audience);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_REFUSED_KO_REASON,
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("Test KO 502 Bad Gateway call probing - REST", async () => {
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

    const apiClientError = mockApiClientError(
      502,
      "Bad Gateway",
      "ERR_BAD_RESPONSE",
    );
    vi.spyOn(apiClientHandler, "sendREST").mockRejectedValue(apiClientError);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe("502");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("Test KO CONNECTION_TIMEOUT call probing - SOAP", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceRecordId: 1,
        technology: "SOAP",
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

    const apiClientError = mockApiClientError(
      500,
      "connect ETIMEDOUT",
      "ETIMEDOUT",
    );
    vi.spyOn(apiClientHandler, "sendSOAP").mockRejectedValue(apiClientError);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_TIMEOUT_KO_REASON,
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendSOAP).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("Test OK call probing - SOAP", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceRecordId: 1,
        technology: "SOAP",
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

    const apiClientResponse = mockApiClientResponse(undefined);
    vi.spyOn(apiClientHandler, "sendSOAP").mockResolvedValue(apiClientResponse);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendSOAP).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("Test OK call probing - REST", async () => {
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

    const apiClientResponse = mockApiClientResponse(undefined);
    vi.spyOn(apiClientHandler, "sendREST").mockResolvedValue(apiClientResponse);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("Test build JWT throws error", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceRecordId: 1,
        technology: "SOAP",
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

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const mockBuildJwtError = makeApplicationError(
      buildJWTError(`Failed to generate signature.`),
      genericLogger,
    );

    vi.spyOn(kmsClientHandler, "buildJWT").mockRejectedValue(mockBuildJwtError);

    try {
      await callerService.performRequest(eservice, ctx);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0004");
    }
  });

  it("Test generic error performRequest", async () => {
    const validMessage: SQS.Message = {
      MessageId: "12345",
      ReceiptHandle: "receipt_handle_id",
      Body: JSON.stringify({
        eserviceRecordId: 1,
        technology: "SOAP",
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

    vi.spyOn(apiClientHandler, "sendSOAP").mockRejectedValue(
      new Error("Generic Error"),
    );
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);

    try {
      await callerService.performRequest(eservice, ctx);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("9999");
    }
  });
});
