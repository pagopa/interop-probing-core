import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import { ApiGetProducersResponse } from "pagopa-interop-probing-eservice-operations-client";

describe("get /producers router test", () => {
  const mockResponse: ApiGetProducersResponse = {
    content: ["Alpha producer", "Beta producer", "Gamma producer"],
  };

  eServiceService.getEservicesProducers = vi
    .fn()
    .mockResolvedValue(mockResponse);

  const validQuery = {
    limit: 10,
    offset: 0,
    producerName: "Alpha producer",
  };

  const makeRequest = async (query: Record<string, unknown> = validQuery) =>
    request(api)
      .get("/producers")
      .set("X-Correlation-Id", uuidv4())
      .query(query);

  it("should return 200 and a list of producers when succeeds", async () => {
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
      eServiceService.getEservicesProducers = vi
        .fn()
        .mockRejectedValueOnce(error);

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
    { offset: 0 },
    { limit: 10 },
  ])("should return 400 for invalid query params: %s", async (query) => {
    const res = await makeRequest(query as Record<string, unknown>);
    expect(res.status).toBe(400);
  });
});
