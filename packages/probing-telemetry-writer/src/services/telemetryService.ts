import {
  TelemetryDimensions,
  TelemetryFields,
  TelemetryMeasurement,
  TelemetryDto,
} from "pagopa-interop-probing-models";
import {
  TelemetryManager,
  Logger,
  TelemetryRecord,
  TelemetryDimension,
  TelemetryField,
} from "pagopa-interop-probing-commons";

export const telemetryWriteServiceBuilder = (
  telemetryManager: TelemetryManager,
) => {
  return {
    async writeRecord(
      eserviceTelemetry: TelemetryDto,
      logger: Logger,
    ): Promise<void> {
      logger.info(
        `Writing Telemetry with eserviceRecordId: ${eserviceTelemetry.eserviceRecordId}`,
      );

      const dimensions = buildDimensions(eserviceTelemetry);
      const fields = buildFields(eserviceTelemetry);

      const record: TelemetryRecord = {
        measurement: TelemetryMeasurement.TELEMETRY,
        timestamp: Number(eserviceTelemetry.checkTime),
        dimensions,
        fields,
      };

      await telemetryManager.writeRecord(record);
    },
  };
};

export type TelemetryWriteService = ReturnType<
  typeof telemetryWriteServiceBuilder
>;

function buildDimensions(telemetry: TelemetryDto): TelemetryDimension[] {
  return [
    {
      name: TelemetryDimensions.ESERVICE_RECORD_ID,
      value: String(telemetry.eserviceRecordId),
    },
    ...(telemetry.status === "KO" && telemetry.koReason
      ? [
          {
            name: TelemetryDimensions.KO_REASON,
            value: String(telemetry.koReason),
          },
        ]
      : []),
  ];
}

function buildFields(telemetry: TelemetryDto): TelemetryField[] {
  return [
    {
      name: TelemetryFields.STATUS,
      value: String(telemetry.status),
    },
    ...(telemetry.responseTime !== undefined
      ? [
          {
            name: TelemetryFields.RESPONSE_TIME,
            value: Number(telemetry.responseTime),
          },
        ]
      : []),
  ];
}
