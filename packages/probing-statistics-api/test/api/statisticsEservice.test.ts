import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, statisticsService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import {
  ApiStatisticsEservicesResponse,
  ApiStatisticsEservicesParams,
  ApiStatisticsEservicesQuery,
} from "../../src/model/types.js";

describe("get /telemetryData/eservices/:eserviceRecordId router test", () => {
  const mockResponse: ApiStatisticsEservicesResponse = {
    performances: [
      {
        responseTime: 120,
        time: "2025-11-11T09:00:00Z",
      },
      {
        responseTime: 0,
        time: "2025-11-11T09:05:00Z",
      },
      {
        responseTime: 0,
        time: "2025-11-11T09:10:00Z",
      },
    ],
    failures: [
      {
        status: "KO",
        time: "2025-11-11T09:05:00Z",
      },
      {
        status: "N_D",
        time: "2025-11-11T09:10:00Z",
      },
    ],
    percentages: [
      { status: "OK", value: 33.33 },
      { status: "KO", value: 33.33 },
      { status: "N_D", value: 33.33 },
    ],
  };

  const params: ApiStatisticsEservicesParams = {
    eserviceRecordId: 1,
  };

  const validQuery: ApiStatisticsEservicesQuery = {
    pollingFrequency: 5,
  };

  statisticsService.getEserviceStatistics = vi
    .fn()
    .mockResolvedValue(mockResponse);

  const makeRequest = async (
    pathParams: ApiStatisticsEservicesParams = params,
    query: Record<string, unknown> = validQuery,
  ) =>
    request(api)
      .get(`/telemetryData/eservices/${pathParams.eserviceRecordId}`)
      .set("X-Correlation-Id", uuidv4())
      .query(query);

  it("should return 200 and the statistics when succeeds", async () => {
    const res = await makeRequest(params, validQuery);

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
      statisticsService.getEserviceStatistics = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest(params, validQuery);

      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    {
      params,
      query: {},
    },
    {
      params,
      query: { pollingFrequency: "invalid" },
    },
    {
      params,
      query: { pollingFrequency: -1 },
    },
    {
      params,
      query: { pollingFrequency: 0 },
    },
    {
      params: { eserviceRecordId: -1 },
      query: validQuery,
    },
    {
      params: { eserviceRecordId: "invalid" },
      query: validQuery,
    },
    {
      params: { eserviceRecordId: 0 },
      query: validQuery,
    },
  ])(
    "should return 400 if invalid request params or query params: %s",
    async ({ params: invalidParams, query }) => {
      const res = await makeRequest(
        invalidParams as ApiStatisticsEservicesParams,
        query as ApiStatisticsEservicesQuery,
      );

      expect(res.status).toBe(400);
    },
  );
});
