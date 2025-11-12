import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, operationsService } from "../vitest.api.setup.js";
import {
  EserviceMonitorState,
  genericError,
} from "pagopa-interop-probing-models";
import { ProbingApiGetEserviceProbingDataResponse } from "../../src/model/types.js";
import { eServiceByRecordIdNotFound } from "../../src/model/domain/errors.js";

describe("get /eservices/probingData/{eserviceRecordId} router test", () => {
  const mockEserviceRecordId = 321;

  const mockResponse: ProbingApiGetEserviceProbingDataResponse = {
    probingEnabled: true,
    eserviceActive: true,
    state: EserviceMonitorState.Values.ONLINE,
    responseReceived: "2025-11-11T09:30:00Z",
  };

  operationsService.getEserviceProbingData = vi
    .fn()
    .mockResolvedValue(mockResponse);

  const makeRequest = async (id: unknown = mockEserviceRecordId) =>
    request(api)
      .get(`/eservices/probingData/${id}`)
      .set("X-Correlation-Id", uuidv4());

  it("should return 200 and probing data when retrieval succeeds", async () => {
    const res = await makeRequest();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(operationsService.getEserviceProbingData).toHaveBeenCalledWith(
      mockEserviceRecordId,
      expect.any(Object),
    );
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
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      operationsService.getEserviceProbingData = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    { eserviceRecordId: "invalid-id" },
    { eserviceRecordId: -1 },
    { eserviceRecordId: null },
  ])(
    "should return 400 if invalid path param is provided: %s",
    async ({ eserviceRecordId }) => {
      const res = await makeRequest(eserviceRecordId);
      expect(res.status).toBe(400);
    },
  );
});
