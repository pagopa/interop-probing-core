import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CallerService,
  callerServiceBuilder,
} from "../src/services/callerService.js";
import { SQS } from "pagopa-interop-probing-commons";
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
  AppError,
  buildJWTError,
  makeApplicationError,
} from "../src/model/domain/errors.js";
import {
  EserviceContentDto,
  TelemetryKoDto,
} from "pagopa-interop-probing-models";

describe("caller service test", () => {
  const mockJWT = `token`;
  const kmsClientHandler: KMSClientHandler = kmsClientBuilder();
  const apiClientHandler: ApiClientHandler = apiClientBuilder();
  const callerService: CallerService = callerServiceBuilder(
    apiClientHandler,
    kmsClientHandler,
  );

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

    const telemetryResult = await callerService.performRequest(eservice);

    expect(kmsClientHandler.buildJWT).toHaveBeenCalledWith(eservice.audience);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_REFUSED_KO_REASON,
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    expect(apiClientHandler.sendREST).toHaveBeenCalledWith(baseUrl, mockJWT);
  });

  it("Test KO UNKNOWN_KO_REASON call probing - REST", async () => {
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

    const apiClientError = mockApiClientError(
      502,
      "Bad Gateway",
      "ERR_BAD_RESPONSE",
    );
    vi.spyOn(apiClientHandler, "sendREST").mockRejectedValue(apiClientError);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.UNKNOWN_KO_REASON,
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
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

    const telemetryResult = await callerService.performRequest(eservice);

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_TIMEOUT_KO_REASON,
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendSOAP).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
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
    };

    const apiClientResponse = mockApiClientResponse(undefined);
    vi.spyOn(apiClientHandler, "sendSOAP").mockResolvedValue(apiClientResponse);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice);

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendSOAP).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
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
    };

    const apiClientResponse = mockApiClientResponse(undefined);
    vi.spyOn(apiClientHandler, "sendREST").mockResolvedValue(apiClientResponse);
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(eservice);

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(apiClientHandler.sendREST).toHaveBeenCalledWith(
      baseUrl,
      mockJWT,
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
    };
    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);

    const mockBuildJwtError = makeApplicationError(
      buildJWTError(`Failed to generate signature.`),
    );
    vi.spyOn(kmsClientHandler, "buildJWT").mockRejectedValue(mockBuildJwtError);

    try {
      await callerService.performRequest(eservice);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0004");
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
    };

    vi.spyOn(apiClientHandler, "sendSOAP").mockRejectedValue(
      new Error("Generic Error"),
    );
    vi.spyOn(kmsClientHandler, "buildJWT").mockResolvedValue(mockJWT);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);

    try {
      await callerService.performRequest(eservice);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("9999");
    }
  });
});
