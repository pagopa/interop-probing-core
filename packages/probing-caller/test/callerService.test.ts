import { afterAll, describe, expect, it, vi } from "vitest";
import {
  CallerService,
  callerServiceBuilder,
} from "../src/services/callerService.js";
import { SQS } from "pagopa-interop-probing-commons";
import {
  EserviceContentDto,
  TelemetryKoDto,
  decodeSQSMessage,
} from "../src/model/models.js";
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

describe("caller service test", () => {
  const kmsClientHandler: KMSClientHandler = kmsClientBuilder();
  const clientHandler: ApiClientHandler = apiClientBuilder(kmsClientHandler);
  const callerService: CallerService = callerServiceBuilder(clientHandler);

  afterAll(() => {
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
      "ECONNREFUSED"
    );
    vi.spyOn(clientHandler, "sendREST").mockRejectedValue(apiClientError);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(
      decodeSQSMessage(validMessage)
    );

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_REFUSED_KO_REASON
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(clientHandler.sendREST).toHaveBeenCalledWith(baseUrl, eservice);
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
      "ERR_BAD_RESPONSE"
    );
    vi.spyOn(clientHandler, "sendREST").mockRejectedValue(apiClientError);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(
      decodeSQSMessage(validMessage)
    );

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.UNKNOWN_KO_REASON
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(clientHandler.sendREST).toHaveBeenCalledWith(baseUrl, eservice);
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
      "ETIMEDOUT"
    );
    vi.spyOn(clientHandler, "sendSOAP").mockRejectedValue(apiClientError);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(
      decodeSQSMessage(validMessage)
    );

    expect(telemetryResult.status).toBe("KO");
    expect((telemetryResult as TelemetryKoDto).koReason).toBe(
      callerConstants.CONNECTION_TIMEOUT_KO_REASON
    );
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(clientHandler.sendSOAP).toHaveBeenCalledWith(baseUrl, eservice);
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
    vi.spyOn(clientHandler, "sendSOAP").mockResolvedValue(apiClientResponse);

    const eservice: EserviceContentDto = decodeSQSMessage(validMessage);
    const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

    const telemetryResult = await callerService.performRequest(
      decodeSQSMessage(validMessage)
    );

    expect(telemetryResult.status).toBe("OK");
    expect(telemetryResult.eserviceRecordId).toBe(eservice.eserviceRecordId);

    await expect(clientHandler.sendSOAP).toHaveBeenCalledWith(baseUrl, eservice);
  });
});
