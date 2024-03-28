import { TelemetryDto, TelemetryKoDto } from "pagopa-interop-probing-models";
import {
  TimestreamWriteClient,
  WriteRecordsCommand,
  _Record,
  Dimension,
  MeasureValueType,
  MeasureValue,
} from "@aws-sdk/client-timestream-write";
import { config } from "./config.js";
import { telemetryConstants } from "./constants.js";
import { logger } from "pagopa-interop-probing-commons";
import { writeRecordTimestreamError } from "../model/domain/errors.js";

export const timestreamWriteClientBuilder = () => {
  const client = new TimestreamWriteClient({
    region: config.awsRegion,
    maxAttempts: config.timestreamRetries,
  });

  return {
    async writeRecord(telemetry: TelemetryDto): Promise<void> {
      try {
        const dimensions = buildDimensions(telemetry);
        const measureValues = buildMeasureValues(telemetry);

        const record: _Record = {
          MeasureName: telemetryConstants.TELEMETRY_MEASURE_NAME,
          MeasureValues: measureValues,
          MeasureValueType: MeasureValueType.MULTI,
          Time: `${telemetry.checkTime}`,
          Dimensions: dimensions,
        };

        const command = new WriteRecordsCommand({
          DatabaseName: config.timestreamDatabase,
          TableName: config.timestreamTable,
          Records: [record],
        });

        await client.send(command);
      } catch (error) {
        logger.error(
          `An error occurred while attempting to write a record to Timestream: ${error}`,
        );
        throw writeRecordTimestreamError(`${error}`);
      }
    },
  };
};

export type TimestreamWriteClientHandler = ReturnType<
  typeof timestreamWriteClientBuilder
>;

const buildDimensions = (telemetry: TelemetryDto): Dimension[] => {
  const dimensions: Dimension[] = [
    {
      Name: telemetryConstants.ESERVICE_RECORD_ID_DIMENSION,
      Value: `${telemetry.eserviceRecordId}`,
    },
  ];

  if ((telemetry as TelemetryKoDto).koReason) {
    dimensions.push({
      Name: telemetryConstants.KO_REASON_DIMENSION,
      Value: (telemetry as TelemetryKoDto).koReason,
    });
  }

  return dimensions;
};

const buildMeasureValues = (telemetry: TelemetryDto): MeasureValue[] => {
  const measureValues: MeasureValue[] = [
    {
      Name: telemetryConstants.STATUS_MEASURE,
      Type: MeasureValueType.VARCHAR,
      Value: `${telemetry.status}`,
    },
  ];

  if (telemetry.responseTime) {
    measureValues.push({
      Name: telemetryConstants.RESPONSE_TIME_MEASURE,
      Type: MeasureValueType.BIGINT,
      Value: `${telemetry.responseTime}`,
    });
  }

  return measureValues;
};
