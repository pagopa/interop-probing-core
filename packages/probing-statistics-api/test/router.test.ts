import { beforeEach, describe, expect, it, vi } from "vitest";
import supertest from "supertest";
import {
  contextMiddleware,
  ExpressContext,
  zodiosCtx,
} from "pagopa-interop-probing-commons";
import statisticsRouter from "../src/routers/statisticsRouter.js";
import {
  TimestreamQueryClientHandler,
  timestreamQueryClientBuilder,
} from "../src/utilities/timestreamQueryClientHandler.js";
import {
  TimestreamService,
  timestreamServiceBuilder,
} from "../src/services/timestreamService.js";
import {
  StatisticsService,
  statisticsServiceBuilder,
} from "../src/services/statisticsService.js";
import {
  Api,
  ApiFilteredStatisticsEservicesParams,
  ApiFilteredStatisticsEservicesQuery,
  ApiStatisticsEservicesParams,
  ApiStatisticsEservicesQuery,
} from "../src/model/types.js";
import { mockTimestreamResponseQuery } from "./utils.js";
import { ZodiosApp } from "@zodios/express";
import { config } from "../src/utilities/config.js";

const timestreamQueryClient: TimestreamQueryClientHandler =
  timestreamQueryClientBuilder();
const timestreamService: TimestreamService = timestreamServiceBuilder(
  timestreamQueryClient,
);
const statisticsService: StatisticsService =
  statisticsServiceBuilder(timestreamService);

const app: ZodiosApp<Api, ExpressContext> = zodiosCtx.app();
app.use(contextMiddleware(config.applicationName));
app.use(statisticsRouter(zodiosCtx)(statisticsService));

const probingApiClient = supertest(app);

describe("eService Router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("e-service telemetry data are retrieved successfully", async () => {
    const params: ApiStatisticsEservicesParams = {
      eserviceRecordId: 1,
    };

    const query: ApiStatisticsEservicesQuery = {
      pollingFrequency: 3,
    };

    vi.spyOn(timestreamQueryClient, "query").mockResolvedValue([
      mockTimestreamResponseQuery,
    ]);

    const response = await probingApiClient
      .get(`/telemetryData/eservices/${params.eserviceRecordId}`)
      .set("Content-Type", "application/json")
      .query(query);

    expect(response.status).toBe(200);
  });

  it("e-service filtered telemetry data are retrieved successfully", async () => {
    const params: ApiFilteredStatisticsEservicesParams = {
      eserviceRecordId: 1,
    };

    const query: ApiFilteredStatisticsEservicesQuery = {
      pollingFrequency: 3,
      startDate: "2024-03-13 21:00:00.57",
      endDate: "2024-03-13 23:30:59.57",
    };

    vi.spyOn(timestreamQueryClient, "query").mockResolvedValue([
      mockTimestreamResponseQuery,
    ]);

    const response = await probingApiClient
      .get(`/telemetryData/eservices/${params.eserviceRecordId}`)
      .set("Content-Type", "application/json")
      .query(query);

    expect(response.status).toBe(200);
  });
});
