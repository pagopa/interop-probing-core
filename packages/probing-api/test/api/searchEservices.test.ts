import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, operationsService } from "../vitest.api.setup.js";
import {
  EserviceMonitorState,
  genericError,
} from "pagopa-interop-probing-models";
import {
  ProbingApiSearchEservicesQuery,
  ProbingApiSearchEservicesResponse,
} from "../../src/model/types.js";

describe("get /eservices router test", () => {
  const mockResponse: ProbingApiSearchEservicesResponse = {
    content: [
      {
        eserviceRecordId: 1,
        eserviceName: "eService",
        producerName: "PagoPA",
        responseReceived: "2025-11-11T09:00:00Z",
        state: EserviceMonitorState.Values.ONLINE,
        versionNumber: 2,
      },
    ],
    offset: 0,
    limit: 10,
    totalElements: 1,
  };

  const validQuery: ProbingApiSearchEservicesQuery = {
    limit: 10,
    offset: 0,
    eserviceName: "eService",
    producerName: "PagoPA",
    versionNumber: 2,
    state: [EserviceMonitorState.Values.ONLINE],
  };

  operationsService.getEservices = vi.fn().mockResolvedValue(mockResponse);

  const makeRequest = async (query: Record<string, unknown> = validQuery) =>
    request(api)
      .get("/eservices")
      .set("X-Correlation-Id", uuidv4())
      .query(query);

  it("should return 200 and a list of e-services when succeeds", async () => {
    const res = await makeRequest(validQuery);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(operationsService.getEservices).toHaveBeenCalledTimes(1);
    expect(operationsService.getEservices).toHaveBeenCalledWith(
      validQuery,
      expect.anything(),
    );
  });

  it.each([
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      operationsService.getEservices = vi.fn().mockRejectedValueOnce(error);
      const res = await makeRequest(validQuery);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    {},
    { limit: 10 },
    { offset: 0 },
    { limit: -1, offset: 0 },
    { limit: 200, offset: 0 },
    { limit: "invalid", offset: 0 },
    { limit: 10, offset: "invalid" },
    { limit: 10, offset: 0, state: ["INVALID_STATE"] },
    { limit: 10, offset: 0, versionNumber: -5 },
  ])("should return 400 for invalid query params: %s", async (query) => {
    const res = await makeRequest(query as Record<string, unknown>);
    expect(res.status).toBe(400);
  });
});
