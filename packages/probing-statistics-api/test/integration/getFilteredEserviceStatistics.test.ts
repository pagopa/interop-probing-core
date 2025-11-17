/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, afterEach } from "vitest";
import {
  addTelemetry,
  mockTelemetryRecord,
  statisticsService,
  telemetryQueryService,
} from "../utils.js";
import { config } from "../../src/utilities/config.js";

afterEach(() => {
  config.graphPerformanceTolerance = 2;
  config.graphFailureTolerance = 4;
  config.graphMaxMonths = 3;
});

describe("getFilteredEserviceStatistics", () => {
  it("should return only telemetry inside the filtered interval", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-01T00:00:00Z"),
        status: "OK",
        responseTime: 300,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-05T00:00:00Z"),
        status: "OK",
        responseTime: 999,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-02T00:00:00Z",
      },
    );

    expect(result.performances.some((p) => (p.responseTime ?? 0) >= 300)).toBe(
      true,
    );
    expect(result.performances.some((p) => (p.responseTime ?? 0) >= 999)).toBe(
      false,
    );
  });

  it("should set average to zero when KO/N_D exceed performance threshold", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-02T10:00:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-02T10:02:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-02T10:04:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-02T10:06:00Z"),
        status: "OK",
        responseTime: 150,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-01-02T10:00:00Z",
        endDate: "2025-01-02T11:00:00Z",
      },
    );

    expect(result.performances.some((p) => p.responseTime === 0)).toBe(true);
  });

  it("should create N_D entries when a time window has no telemetry samples", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-02T10:00:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-02T10:10:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    const values = await telemetryQueryService.findStatistics({
      eserviceRecordId,
      pollingFrequency: 5,
      startDate: "2025-01-02T10:00:00Z",
      endDate: "2025-01-02T10:15:00Z",
    });

    const ndExists = values.some(
      (v) =>
        v.status === "N_D" &&
        new Date(v.time).toISOString() === "2025-01-02T10:05:00.000Z",
    );

    expect(ndExists).toBe(true);
  });

  it("should merge close timestamps and compute averaged responseTime", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-04T10:02:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-04T10:03:00Z"),
        status: "OK",
        responseTime: 140,
      }),
    );

    const values = await telemetryQueryService.findStatistics({
      eserviceRecordId,
      pollingFrequency: 5,
      startDate: "2025-01-04T10:00:00Z",
      endDate: "2025-01-04T10:10:00Z",
    });

    const timeWindow = values.find(
      (v) => new Date(v.time).toISOString() === "2025-01-04T10:00:00.000Z",
    );

    expect(timeWindow).toBeDefined();
    expect(timeWindow!.responseTime).toBe(120);
  });

  it("should compute OK/KO/N_D percentages correctly", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-08T00:00:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-08T00:05:00Z"),
        status: "OK",
        responseTime: 110,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-08T00:10:00Z"),
        status: "OK",
        responseTime: 120,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-08T00:15:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-01-08T00:00:00Z",
        endDate: "2025-01-08T00:15:00Z",
      },
    );

    const eservicesStatusOK = result.percentages.find(
      (p) => p.status === "OK",
    )!;
    const eservicesStatusKO = result.percentages.find(
      (p) => p.status === "KO",
    )!;
    const eservicesStatusND = result.percentages.find(
      (p) => p.status === "N_D",
    )!;

    expect(Math.round(eservicesStatusOK.value)).toBe(75);
    expect(Math.round(eservicesStatusKO.value)).toBe(25);
    expect(Math.round(eservicesStatusND.value)).toBe(0);
  });

  it("should produce no failures when all samples are OK", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-02-01T10:00:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-02-01T10:05:00Z"),
        status: "OK",
        responseTime: 150,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-02-01T10:00:00Z",
        endDate: "2025-02-01T10:10:00Z",
      },
    );

    expect(result.failures.length).toBe(0);
  });

  it("should produce KO failure only when KO fraction meets threshold", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-01T10:00:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-01T10:05:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-01T10:10:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );
    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-01T10:15:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-03-01T10:00:00Z",
        endDate: "2025-03-01T10:30:00Z",
      },
    );

    expect(result.failures.some((f) => f.status === "KO")).toBe(true);
  });

  it("should not produce KO failure when KO fraction is below threshold", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-02T10:00:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    for (let i = 1; i <= 30; i++) {
      await addTelemetry(
        mockTelemetryRecord({
          eserviceRecordId,
          timestamp: new Date(
            `2025-03-02T10:${String(i).padStart(2, "0")}:00Z`,
          ),
          status: "N_D",
          responseTime: 0,
        }),
      );
    }

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-03-02T10:00:00Z",
        endDate: "2025-03-02T11:00:00Z",
      },
    );

    expect(result.failures.some((f) => f.status === "KO")).toBe(false);
  });

  it("should ensure percentages always sum to 100", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-05T00:00:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-03-05T00:05:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-03-05T00:00:00Z",
        endDate: "2025-03-05T00:10:00Z",
      },
    );

    const sum = result.percentages.reduce((s, p) => s + p.value, 0);

    expect(sum).toBeCloseTo(100, 1);
  });

  it("should use weekly granularity for windows longer than one week", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-01T00:00:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-15T00:00:00Z",
      },
    );

    expect(result.performances.length).toBeLessThan(30);
  });

  it("should use week-based granularity (6h x number of weeks) for windows longer than one month", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-01T00:00:00Z"),
        status: "OK",
        responseTime: 100,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-03-15T00:00:00Z",
      },
    );

    const timestamps = result.performances.map((p) =>
      new Date(p.time!).getTime(),
    );
    timestamps.sort((a, b) => a - b);

    const diffs = [];
    for (let i = 1; i < timestamps.length; i++) {
      diffs.push(timestamps[i] - timestamps[i - 1]);
    }

    const minDiff = Math.min(...diffs);

    const expectedHours =
      Math.floor(
        (new Date("2025-03-15").getTime() - new Date("2025-01-01").getTime()) /
          (7 * 24 * 3600 * 1000),
      ) * 6;

    const expectedMs = expectedHours * 3600_000;

    expect(minDiff).toBeCloseTo(expectedMs, -2);
  });

  it("should zero-out average earlier when performanceTolerance is lowered", async () => {
    config.graphPerformanceTolerance = 1;

    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-04-01T10:00:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-04-01T10:05:00Z"),
        status: "OK",
        responseTime: 200,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-04-01T10:00:00Z",
        endDate: "2025-04-01T10:10:00Z",
      },
    );

    expect(result.performances.some((p) => p.responseTime === 0)).toBe(true);
  });

  it("should produce KO failures earlier when failureTolerance is lowered", async () => {
    config.graphFailureTolerance = 2;

    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-04-02T12:00:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-04-02T12:05:00Z"),
        status: "OK",
        responseTime: 200,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-04-02T12:00:00Z",
        endDate: "2025-04-02T12:10:00Z",
      },
    );

    expect(result.failures.some((f) => f.status === "KO")).toBe(true);
  });

  it("should not produce KO failures when failureTolerance is increased", async () => {
    config.graphFailureTolerance = 10;

    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-04-03T10:00:00Z"),
        status: "KO",
        responseTime: 0,
      }),
    );

    for (let i = 1; i <= 20; i++) {
      await addTelemetry(
        mockTelemetryRecord({
          eserviceRecordId,
          timestamp: new Date(
            `2025-04-03T10:${String(i).padStart(2, "0")}:00Z`,
          ),
          status: "OK",
          responseTime: 100,
        }),
      );
    }

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-04-03T10:00:00Z",
        endDate: "2025-04-03T11:00:00Z",
      },
    );

    expect(result.failures.some((f) => f.status === "KO")).toBe(false);
  });

  it("should adjust granularity when graphMaxMonths is reduced", async () => {
    config.graphMaxMonths = 1;

    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date("2025-01-01T00:00:00Z"),
        status: "OK",
        responseTime: 120,
      }),
    );

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-03-15T00:00:00Z",
      },
    );

    const timestamps = result.performances
      .filter((p) => p.time)
      .map((p) => new Date(p.time!).getTime())
      .sort((a, b) => a - b);

    const diffs: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      diffs.push(timestamps[i] - timestamps[i - 1]);
    }

    const minDiff = Math.min(...diffs);
    expect(minDiff).toBeLessThan(10 * 24 * 3600_000);
  });

  it("should handle 12-month window with 1000-sample 33/33/33 distribution", async () => {
    config.graphMaxMonths = 12;

    const eserviceRecordId = 1;

    const startDate = new Date("2024-01-01T00:00:00Z").getTime();
    const endDate = new Date("2025-01-01T00:00:00Z").getTime();

    const totalSamples = 1000;
    const step = Math.floor((endDate - startDate) / totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const timestamp = new Date(startDate + i * step);

      const statusIndex = i % 3;
      const status =
        statusIndex === 0 ? "OK" : statusIndex === 1 ? "KO" : "N_D";
      const responseTime = status === "OK" ? 200 : 0;

      await addTelemetry(
        mockTelemetryRecord({
          eserviceRecordId,
          timestamp,
          status,
          responseTime,
        }),
      );
    }

    const result = await statisticsService.getFilteredEserviceStatistics(
      { eserviceRecordId },
      {
        pollingFrequency: 5,
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2025-01-01T00:00:00Z",
      },
    );

    expect(result.performances.length).toBeGreaterThan(5);
    expect(result.performances.length).toBeLessThan(400);

    const eservicesStatusOK = result.percentages.find(
      (p) => p.status === "OK",
    )!.value;
    const eservicesStatusKO = result.percentages.find(
      (p) => p.status === "KO",
    )!.value;
    const eservicesStatusND = result.percentages.find(
      (p) => p.status === "N_D",
    )!.value;

    expect(eservicesStatusOK).toBeLessThan(10);
    expect(eservicesStatusKO).toBeLessThan(10);
    expect(eservicesStatusND).toBeGreaterThan(80);
  });
});
