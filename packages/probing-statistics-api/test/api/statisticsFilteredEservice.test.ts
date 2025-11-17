import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, statisticsService } from "../vitest.api.setup.js";

import { genericError } from "pagopa-interop-probing-models";
import {
  ApiFilteredStatisticsEservicesResponse,
  ApiFilteredStatisticsEservicesParams,
  ApiFilteredStatisticsEservicesQuery,
} from "../../src/model/types.js";

describe("get /telemetryData/eservices/filtered/:eserviceRecordId router test", () => {
  const mockResponse: ApiFilteredStatisticsEservicesResponse = {
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

  const params: ApiFilteredStatisticsEservicesParams = {
    eserviceRecordId: 1,
  };

  const validQuery: ApiFilteredStatisticsEservicesQuery = {
    pollingFrequency: 5,
    startDate: "2025-11-11T09:00:00Z",
    endDate: "2025-11-11T10:00:00Z",
  };

  statisticsService.getFilteredEserviceStatistics = vi
    .fn()
    .mockResolvedValue(mockResponse);

  const makeRequest = async (
    pathParams: ApiFilteredStatisticsEservicesParams = params,
    query: Record<string, unknown> = validQuery,
  ) =>
    request(api)
      .get(`/telemetryData/eservices/filtered/${pathParams.eserviceRecordId}`)
      .set("X-Correlation-Id", uuidv4())
      .query(query);

  it("should return 200 and the filtered statistics when succeeds", async () => {
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
      statisticsService.getFilteredEserviceStatistics = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest(params, validQuery);

      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    { params, query: {} },
    { params, query: { pollingFrequency: 5, startDate: validQuery.startDate } },
    { params, query: { pollingFrequency: 5, endDate: validQuery.endDate } },
    {
      params,
      query: { startDate: validQuery.startDate, endDate: validQuery.endDate },
    },
    { params, query: { ...validQuery, pollingFrequency: "invalid" } },
    { params, query: { ...validQuery, pollingFrequency: -1 } },
    { params, query: { ...validQuery, pollingFrequency: 0 } },
    { params, query: { ...validQuery, startDate: "not-a-date" } },
    { params, query: { ...validQuery, endDate: "invalid-date" } },
    { params: { eserviceRecordId: -1 }, query: validQuery },
    { params: { eserviceRecordId: "invalid" }, query: validQuery },
    { params: { eserviceRecordId: 0 }, query: validQuery },
  ])(
    "should return 400 if invalid request params or query params: %s",
    async ({ params: invalidParams, query }) => {
      const res = await makeRequest(
        invalidParams as ApiFilteredStatisticsEservicesParams,
        query as ApiFilteredStatisticsEservicesQuery,
      );

      expect(res.status).toBe(400);
    },
  );
});
