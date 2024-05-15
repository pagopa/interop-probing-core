import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TimestreamService,
  timestreamServiceBuilder,
} from "../src/services/timestreamService.js";
import {
  StatisticsService,
  statisticsServiceBuilder,
} from "../src/services/statisticsService.js";

import {
  TimestreamQueryClientHandler,
  timestreamQueryClientBuilder,
} from "../src/utilities/timestreamQueryClientHandler.js";
import { mockTimestreamResponseQuery } from "./utils.js";
import {
  DateUnit,
  changeDateFormat,
  timeBetween,
  TimeFormat,
  truncatedTo,
} from "../src/utilities/date.js";

describe("Statistics service test", () => {
  const timestreamQueryClient: TimestreamQueryClientHandler =
    timestreamQueryClientBuilder();
  const timestreamService: TimestreamService = timestreamServiceBuilder(
    timestreamQueryClient,
  );
  const statisticsService: StatisticsService =
    statisticsServiceBuilder(timestreamService);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invoke statisticsEservices service should not throw error", async () => {
    const telemetryParams = {
      eserviceRecordId: 1,
    };

    const telemetryQuery = {
      pollingFrequency: 3,
    };

    vi.spyOn(timestreamQueryClient, "query").mockResolvedValue([
      mockTimestreamResponseQuery,
    ]);

    const { performances, failures, percentages } =
      await statisticsService.statisticsEservices(
        telemetryParams,
        telemetryQuery,
      );

    expect(performances.length).greaterThan(0);
    expect(failures.length).greaterThan(0);
    expect(percentages.length).greaterThan(0);
  });

  it("invoke filteredStatisticsEservices service should not throw error", async () => {
    const telemetryParams = {
      eserviceRecordId: 1,
    };

    const telemetryQuery = {
      pollingFrequency: 3,
      startDate: "2024-03-13 21:00:00.57",
      endDate: "2024-03-13 23:30:59.57",
    };

    vi.spyOn(timestreamQueryClient, "query").mockResolvedValue([
      mockTimestreamResponseQuery,
    ]);

    const { performances, failures, percentages } =
      await statisticsService.filteredStatisticsEservices(
        telemetryParams,
        telemetryQuery,
      );

    expect(performances.length).greaterThan(0);
    expect(failures.length).greaterThan(0);
    expect(percentages.length).greaterThan(0);

    let granularityPerWeeks: number = 1;

    if (telemetryQuery.startDate && telemetryQuery.endDate) {
      granularityPerWeeks =
        timeBetween(
          telemetryQuery.startDate,
          telemetryQuery.endDate,
          DateUnit.WEEKS,
        ) * 6;
      if (granularityPerWeeks < 1) {
        granularityPerWeeks = 1;
      }
    }

    const nowTrucanted: string = `${truncatedTo(
      new Date().toISOString(),
      granularityPerWeeks !== 1 ? DateUnit.DAYS : DateUnit.HOURS,
    )}`;

    expect(performances[0].time).toBe("2024-03-13 21:00:00.000000000");
    expect(performances[performances.length - 1].time).toBe(
      changeDateFormat(nowTrucanted, TimeFormat.YY_MM_DD_HH_MM_SS),
    );

    expect(failures.some((el) => el.status === "KO")).toBe(true);
    expect(failures.some((el) => el.status === "N/D")).toBe(true);

    expect(percentages.find((el) => el.status === "OK")?.value).toBe(20);
    expect(percentages.find((el) => el.status === "KO")?.value).toBe(40);
    expect(percentages.find((el) => el.status === "N/D")?.value).toBe(40);
  });
});
