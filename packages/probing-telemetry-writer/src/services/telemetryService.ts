import { TelemetryDto } from "pagopa-interop-probing-models";
import { TimestreamWriteClientHandler } from "../utilities/timestreamWriteClientHandler.js";
import {
  AppContext,
  logger,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";

export const telemetryWriteServiceBuilder = (
  timestreamWriteClient: TimestreamWriteClientHandler,
) => {
  return {
    async writeRecord(
      telemetry: TelemetryDto,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<void> {
      logger(ctx).info(
        `Writing Telemetry with eserviceRecordId: ${telemetry.eserviceRecordId}`,
      );
      await timestreamWriteClient.writeRecord(telemetry);
    },
  };
};

export type TelemetryWriteService = ReturnType<
  typeof telemetryWriteServiceBuilder
>;
