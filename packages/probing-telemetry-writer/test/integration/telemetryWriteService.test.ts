import { afterEach, describe, expect, it, vi } from "vitest";
import { TelemetryDto } from "pagopa-interop-probing-models";
import { genericLogger } from "pagopa-interop-probing-commons";
import {
  getTelemetryByEServiceRecordId,
  telemetryWriteService,
} from "../utils.js";

describe("Telemetry service test", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should write an OK telemetry record", async () => {
    const eserviceRecordId = 1;
    const eServiceTelemetry: TelemetryDto = {
      status: "OK",
      eserviceRecordId,
      checkTime: `${Date.now()}`,
      responseTime: 150,
    };

    await telemetryWriteService.writeRecord(eServiceTelemetry, genericLogger);

    const eServiceTelemetryResult =
      await getTelemetryByEServiceRecordId(eserviceRecordId);

    expect(eServiceTelemetryResult).toBeDefined();
    expect(Number(eServiceTelemetryResult.eservice_record_id)).toBe(
      eserviceRecordId,
    );
    expect(eServiceTelemetryResult.status).toBe("OK");
    expect(eServiceTelemetryResult.response_time).toBe(150);
  });

  it("should write a KO telemetry record with koReason", async () => {
    const eserviceRecordId = 1;
    const eServiceTelemetry: TelemetryDto = {
      status: "KO",
      eserviceRecordId,
      checkTime: `${Date.now()}`,
      koReason: "Timeout",
      responseTime: 0,
    };

    await telemetryWriteService.writeRecord(eServiceTelemetry, genericLogger);

    const eServiceTelemetryResult =
      await getTelemetryByEServiceRecordId(eserviceRecordId);

    expect(eServiceTelemetryResult).toBeDefined();
    expect(Number(eServiceTelemetryResult.eservice_record_id)).toBe(
      eserviceRecordId,
    );
    expect(eServiceTelemetryResult.status).toBe("KO");
    expect(eServiceTelemetryResult.ko_reason).toBe("Timeout");
  });

  it("should write telemetry with the correct timestamp", async () => {
    const now = Date.now();
    const eserviceRecordId = 1;
    const eServiceTelemetry: TelemetryDto = {
      status: "OK",
      eserviceRecordId,
      checkTime: `${now}`,
      responseTime: 200,
    };

    await telemetryWriteService.writeRecord(eServiceTelemetry, genericLogger);

    const eServiceTelemetryResult = await getTelemetryByEServiceRecordId(
      eServiceTelemetry.eserviceRecordId,
    );
    expect(eServiceTelemetryResult).toBeDefined();
    expect(Number(eServiceTelemetryResult.eservice_record_id)).toBe(
      eServiceTelemetry.eserviceRecordId,
    );
  });

  it("should throw a telemetryWriteError", async () => {
    const eServiceTelemetry = {
      eserviceRecordId: 9999,
      checkTime: Date.now().toString(),
      status: "OK",
      responseTime: Number.NaN,
    } as TelemetryDto;

    await expect(
      telemetryWriteService.writeRecord(eServiceTelemetry, genericLogger),
    ).rejects.toMatchObject({
      code: "telemetryWriteError",
    });
  });
});
