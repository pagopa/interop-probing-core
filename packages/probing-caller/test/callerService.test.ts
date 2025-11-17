import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CallerService,
  callerServiceBuilder,
} from "../src/services/callerService.js";
import {
  AppContext,
  decodeSQSMessage,
  decodeSQSMessageCorrelationId,
  SQS,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
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
import { buildJWTError } from "../src/model/domain/errors.js";
import {
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

  it("should mark REST probing as KO when the connection is refused", async () => {
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

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );
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

  it("should mark REST probing as KO when a 502 Bad Gateway error occurs", async () => {
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

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe("502");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("should mark SOAP probing as KO when the connection times out", async () => {
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

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_TIMEOUT_KO_REASON,
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    expect(apiClientHandler.sendSOAP).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("should mark SOAP probing as OK when the service responds successfully", async () => {
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

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    expect(apiClientHandler.sendSOAP).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("should mark REST probing as OK when the service responds successfully", async () => {
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

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
      ctx,
    );
  });

  it("should throw a BUILD_JWT_ERROR when JWT generation fails", async () => {
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

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );

    const buildErr = buildJWTError("Failed to generate signature.");

    vi.spyOn(kmsClientHandler, "buildJWT").mockRejectedValue(buildErr);

    await expect(
      callerService.performRequest(eservice, ctx),
    ).rejects.toMatchObject({
      code: "buildJWTError",
    });
  });

  it("should return a KO telemetry with genericError when performRequest fails unexpectedly", async () => {
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

    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);
    vi.spyOn(apiClientHandler, "sendSOAP").mockRejectedValue(
      new Error("Generic Error"),
    );

    const eservice = decodeSQSMessage<EserviceContentDto>(
      validMessage,
      EserviceContentDto,
    );

    const telemetryResult = await callerService.performRequest(eservice, ctx);

    expect(telemetryResult.status).toBe("KO");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);
    expect((telemetryResult as TelemetryKoDto).koReason).toBe("Unknown");
  });
});
