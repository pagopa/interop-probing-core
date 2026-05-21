/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from "vitest";
import {
  addTelemetry,
  mockTelemetryRecord,
  statisticsService,
} from "../utils.js";

describe("getEserviceStatistics (24h window)", () => {
  it("should compute correct average for OK telemetry in the last 24h", async () => {
    const eserviceRecordId = 1;
    const t1 = new Date(Date.now() - 20 * 60 * 1000);
    const t2 = new Date(Date.now() - 5 * 60 * 1000);

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        status: "OK",
        responseTime: 200,
        timestamp: t1,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        status: "OK",
        responseTime: 100,
        timestamp: t2,
      }),
    );

    const result = await statisticsService.getEserviceStatistics(
      { eserviceRecordId },
      { pollingFrequency: 30 },
    );

    const valid = result.performances.filter(
      (p) => p.responseTime && p.responseTime > 0,
    );
    expect(valid.length).toBeGreaterThan(0);

    const avg = valid.reduce((s, p) => s + p.responseTime!, 0) / valid.length;
    expect(avg).toBeGreaterThanOrEqual(100);
    expect(avg).toBeLessThanOrEqual(200);
  });

  it("should build hourly aggregation for 24h window", async () => {
    const eserviceRecordId = 1;
    const now = Date.now();

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        status: "OK",
        responseTime: 150,
        timestamp: new Date(now - 60 * 60 * 1000),
      }),
    );

    const result = await statisticsService.getEserviceStatistics(
      { eserviceRecordId },
      { pollingFrequency: 5 },
    );

    expect(result.performances.length).toBeGreaterThan(0);
  });

  it("should return zero failures when all statuses are OK", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        status: "OK",
        responseTime: 150,
        timestamp: new Date(),
      }),
    );

    const result = await statisticsService.getEserviceStatistics(
      { eserviceRecordId },
      { pollingFrequency: 5 },
    );

    expect(result.failures.some((f) => f.status === "KO")).toBe(false);
  });

  it("should create a KO failure when a time window contains only a KO sample", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        status: "KO",
        responseTime: 0,
        timestamp: new Date(),
      }),
    );

    const result = await statisticsService.getEserviceStatistics(
      { eserviceRecordId },
      { pollingFrequency: 5 },
    );

    expect(result.failures.some((f) => f.status === "KO")).toBe(true);
  });

  it("should compute percentages and ensures they sum to 100", async () => {
    const eserviceRecordId = 1;

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date(),
        status: "OK",
        responseTime: 120,
      }),
    );

    await addTelemetry(
      mockTelemetryRecord({
        eserviceRecordId,
        timestamp: new Date(),
        status: "KO",
        responseTime: 0,
      }),
    );

    const result = await statisticsService.getEserviceStatistics(
      { eserviceRecordId },
      { pollingFrequency: 5 },
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

    expect(eservicesStatusOK.value).toBeGreaterThanOrEqual(0);
    expect(eservicesStatusKO.value).toBeGreaterThanOrEqual(0);
    expect(eservicesStatusND.value).toBeGreaterThanOrEqual(0);

    const sum =
      eservicesStatusOK.value +
      eservicesStatusKO.value +
      eservicesStatusND.value;
    expect(sum).toBeCloseTo(100, 1);
  });
});
