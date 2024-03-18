import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TimestreamService,
  timestreamServiceBuilder,
} from "../src/services/timestreamService.js";
import {
  TimestreamQueryClientHandler,
  timestreamQueryClientBuilder,
} from "../src/utilities/timestreamQueryClientHandler.js";
import { mockTimestreamResponseQuery } from "./utils.js";

describe("Timestream service test", () => {
  const timestreamQueryClient: TimestreamQueryClientHandler =
    timestreamQueryClientBuilder();
  const timestreamService: TimestreamService = timestreamServiceBuilder(
    timestreamQueryClient
  );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invoke findStatistics service should not throw error", async () => {
    const telemetryQuery = {
      eserviceRecordId: 1,
      pollingFrequency: 3,
      startDate: "2024-03-13 21:00:00.57",
      endDate: "2024-03-13 23:30:59.57",
    };

    vi.spyOn(timestreamQueryClient, "query").mockResolvedValue([mockTimestreamResponseQuery]);

    await expect(
      timestreamService.findStatistics(telemetryQuery)
    ).resolves.not.toThrow();

    const content = await timestreamService.findStatistics(telemetryQuery);

    expect(content.length).toBeGreaterThanOrEqual(1);
  });
});
