import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import {
  EserviceInteropState,
  EserviceMonitorState,
  genericError,
} from "pagopa-interop-probing-models";
import { ApiSearchEservicesResponse } from "pagopa-interop-probing-eservice-operations-client";

describe("get /eservices router test", () => {
  const mockResponse: ApiSearchEservicesResponse = {
    content: [
      {
        eserviceRecordId: 1,
        eserviceName: "eService",
        producerName: "PagoPA",
        state: EserviceInteropState.Values.ACTIVE,
        versionNumber: 2,
        basePath: ["/api/payments"],
        technology: "REST",
        pollingFrequency: 15,
        probingEnabled: true,
        audience: ["public"],
      },
    ],
    offset: 0,
    limit: 1,
    totalElements: 1,
  };

  eServiceService.searchEservices = vi.fn().mockResolvedValue(mockResponse);

  const validQuery = {
    limit: 10,
    offset: 0,
    eserviceName: "eService",
    producerName: "PagoPA",
    versionNumber: 2,
    state: [EserviceMonitorState.Values.ONLINE],
  };

  const makeRequest = async (query: Record<string, unknown> = validQuery) =>
    request(api)
      .get("/eservices")
      .set("X-Correlation-Id", uuidv4())
      .query(query);

  it("should return 200 and a list of eservices when succeeds", async () => {
    const res = await makeRequest();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
  });

  it.each([
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      eServiceService.searchEservices = vi.fn().mockRejectedValueOnce(error);
      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    { ...validQuery, limit: -1 },
    { ...validQuery, limit: 999 },
    { ...validQuery, offset: -5 },
    { ...validQuery, limit: "not-a-number" },
    { ...validQuery, offset: "invalid" },
    { ...validQuery, state: ["INVALID_STATE"] },
    { offset: 0 },
    { limit: 10 },
  ])("should return 400 for invalid query params: %s", async (query) => {
    const res = await makeRequest(query as Record<string, unknown>);
    expect(res.status).toBe(400);
  });
});
