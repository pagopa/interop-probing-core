import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TelemetryKoDto,
  TelemetryOkDto,
  responseStatus,
} from "pagopa-interop-probing-models";
import {
  TelemetryWriteService,
  telemetryWriteServiceBuilder,
} from "../src/services/telemetryService.js";
import {
  AppError,
  makeApplicationError,
  writeRecordTimestreamError,
} from "../src/model/domain/errors.js";
import { timestreamWriteClientBuilder } from "../src/utilities/timestreamWriteClientHandler.js";

describe("Telemetry service test", () => {
  const timestreamWriteClient = timestreamWriteClientBuilder();
  const telemetryService: TelemetryWriteService = telemetryWriteServiceBuilder(
    timestreamWriteClient
  );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invoke writeRecord service should not throw error", async () => {
    const telemetry: TelemetryKoDto = {
      eserviceRecordId: 1,
      checkTime: Date.now().toString(),
      status: responseStatus.ko,
      koReason: "Connection refused",
      responseTime: 16,
    };

    vi.spyOn(timestreamWriteClient, "writeRecord").mockResolvedValue(undefined);

    await expect(
      async () => await telemetryService.writeRecord(telemetry)
    ).not.toThrowError();
  });

  it("invoke writeRecord service should throw error", async () => {
    const telemetry: TelemetryOkDto = {
      eserviceRecordId: 1,
      checkTime: Date.now().toString(),
      status: responseStatus.ok,
      responseTime: 16,
    };

    vi.spyOn(timestreamWriteClient, "writeRecord").mockRejectedValue(
      makeApplicationError(
        writeRecordTimestreamError(
          "Generic error"
        )
      )
    );

    try {
      await telemetryService.writeRecord(telemetry);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
    }
  });
});
