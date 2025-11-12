import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { api, eServiceService } from "../vitest.api.setup.js";
import { v4 as uuidv4 } from "uuid";
import {
  EserviceInteropState,
  EserviceStatus,
  genericError,
} from "pagopa-interop-probing-models";
import { eServiceByRecordIdNotFound } from "../../src/model/domain/errors.js";
import { ApiGetEserviceProbingDataResponse } from "pagopa-interop-probing-eservice-operations-client";

describe("get /eservices/probingData/{eserviceRecordId} router test", () => {
  const mockEserviceRecordId = 123;

  const mockResponse: ApiGetEserviceProbingDataResponse = {
    probingEnabled: true,
    state: EserviceInteropState.Values.ACTIVE,
    responseReceived: "2025-11-11T09:00:00Z",
    lastRequest: "2025-11-11T08:55:00Z",
    responseStatus: EserviceStatus.Values.OK,
    pollingFrequency: 10,
  };

  eServiceService.getEserviceProbingData = vi
    .fn()
    .mockResolvedValue(mockResponse);

  const makeRequest = async (id: number = mockEserviceRecordId) =>
    request(api)
      .get(`/eservices/probingData/${id}`)
      .set("X-Correlation-Id", uuidv4());

  it("should return 200 and eservice probing data when succeeds", async () => {
    const res = await makeRequest();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
  });

  it.each([
    {
      error: eServiceByRecordIdNotFound(mockEserviceRecordId),
      expectedStatus: 404,
    },
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus when $error.code occurs",
    async ({ error, expectedStatus }) => {
      eServiceService.getEserviceProbingData = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([NaN, -1, "invalid-id"])(
    "should return 400 if invalid eserviceRecordId: %s",
    async (invalidId) => {
      const res = await makeRequest(invalidId as unknown as number);
      expect(res.status).toBe(400);
    },
  );
});
