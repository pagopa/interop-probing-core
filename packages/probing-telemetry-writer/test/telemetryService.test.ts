import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApplicationError,
  TelemetryKoDto,
  TelemetryOkDto,
  responseStatus,
} from "pagopa-interop-probing-models";
import {
  TelemetryWriteService,
  telemetryWriteServiceBuilder,
} from "../src/services/telemetryService.js";
import {
  ErrorCodes,
  makeApplicationError,
  writeRecordTimestreamError,
} from "../src/model/domain/errors.js";
import { timestreamWriteClientBuilder } from "../src/utilities/timestreamWriteClientHandler.js";
import {
  AppContext,
  genericLogger,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { config } from "../src/utilities/config.js";
import { v4 as uuidv4 } from "uuid";

describe("Telemetry service test", () => {
  const timestreamWriteClient = timestreamWriteClientBuilder();
  const telemetryService: TelemetryWriteService = telemetryWriteServiceBuilder(
    timestreamWriteClient,
  );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invoke writeRecord service should not throw error", async () => {
    const telemetry: TelemetryKoDto = {
      eserviceRecordId: 2,
      checkTime: Date.now().toString(),
      status: responseStatus.ko,
      koReason: "Connection error",
    };
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: "MESSAGE_ID",
      correlationId: uuidv4(),
    };

    vi.spyOn(timestreamWriteClient, "writeRecord").mockResolvedValue(undefined);

    await expect(
      telemetryService.writeRecord(telemetry, ctx),
    ).resolves.not.toThrow();
  });

  it("invoke writeRecord service should throw error", async () => {
    const telemetry: TelemetryOkDto = {
      eserviceRecordId: 1,
      checkTime: Date.now().toString(),
      status: responseStatus.ok,
      responseTime: 16,
    };
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: "MESSAGE_ID",
      correlationId: uuidv4(),
    };

    vi.spyOn(timestreamWriteClient, "writeRecord").mockRejectedValue(
      makeApplicationError(
        writeRecordTimestreamError("Generic error"),
        genericLogger,
      ),
    );

    try {
      await telemetryService.writeRecord(telemetry, ctx);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0002");
    }
  });
});
