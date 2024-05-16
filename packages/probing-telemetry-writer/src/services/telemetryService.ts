import { TelemetryDto } from "pagopa-interop-probing-models";
import { TimestreamWriteClientHandler } from "../utilities/timestreamWriteClientHandler.js";
import { makeApplicationError } from "../model/domain/errors.js";
import { logger } from "pagopa-interop-probing-commons";

export const telemetryWriteServiceBuilder = (
  timestreamWriteClient: TimestreamWriteClientHandler,
) => {
  return {
    async writeRecord(telemetry: TelemetryDto): Promise<void> {
      try {
        logger.info(
          `Writing Telemetry with eserviceRecordId ${telemetry.eserviceRecordId}`,
        );
        await timestreamWriteClient.writeRecord(telemetry);
      } catch (error: unknown) {
        throw makeApplicationError(error);
      }
    },
  };
};

export type TelemetryWriteService = ReturnType<
  typeof telemetryWriteServiceBuilder
>;
