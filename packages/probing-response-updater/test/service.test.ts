import { afterAll, describe, expect, it, vi } from "vitest";
import { responseStatus } from "pagopa-interop-probing-models";
import { createApiClient } from "../../probing-eservice-operations/src/model/generated/api.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "../src/services/eserviceService.js";
import { AppError } from "../src/model/domain/errors.js";
import { config } from "./../src/utilities/config.js";
import { mockApiClientError } from "./utils.js";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("eService service test", () => {
  const eserviceService: EserviceService = eServiceServiceBuilder(apiClient);

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("finding the e-service identified by eserviceRecordId, response received is successfully updated", async () => {
    const eserviceRecordId = 1;
    const status = responseStatus.ok;
    const responseReceived = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
    ).toISOString();

    vi.spyOn(apiClient, "updateResponseReceived").mockResolvedValue(undefined);

    await expect(
      async () =>
        await eserviceService.updateResponseReceived({
          params: { eserviceRecordId },
          payload: {
            status,
            responseReceived,
          },
        })
    ).not.toThrowError();
  });

  it("finding the e-service identified by eserviceRecordId, an exception apiUpdateResponseReceivedError should be thrown with status 500", async () => {
    const eserviceRecordId = 1;
    const status = responseStatus.ok;
    const responseReceived = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
    ).toISOString();

    const apiClientError = mockApiClientError(500, "Internal server error");

    vi.spyOn(apiClient, "updateResponseReceived").mockRejectedValueOnce(
      apiClientError
    );

    try {
      await eserviceService.updateResponseReceived({
        params: { eserviceRecordId },
        payload: {
          status,
          responseReceived,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).status).toBe(500);
    }
  });

  it("finding the e-service identified by eserviceRecordId, an exception apiUpdateResponseReceivedError should be thrown with failed Zodios validation", async () => {
    const eserviceRecordId = 1;
    const status = responseStatus.ok;
    const responseReceived = "2023-04-06";

    try {
      await eserviceService.updateResponseReceived({
        params: { eserviceRecordId },
        payload: {
          status,
          responseReceived,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0001");
    }
  });
});
