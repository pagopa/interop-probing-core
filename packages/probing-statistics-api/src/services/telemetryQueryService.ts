import {
  TelemetryPointInfluxModel,
  TelemetryPoint,
  TelemetryMeasurement,
  TelemetryFailureStatus,
  TelemetrySuccessStatus,
  TelemetryStatus,
  TelemetryFields,
} from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";
import {
  changeDateFormat,
  DateUnit,
  normalizeDateRange,
  timeBetween,
  TimeFormat,
} from "../utilities/date.js";
import { TelemetryManager } from "pagopa-interop-probing-commons";
import { match } from "ts-pattern";

const INFLUX_BUCKET = config.influxBucket;
const MEASUREMENT = TelemetryMeasurement.TELEMETRY;
const FIELD_RESPONSE_TIME = TelemetryFields.RESPONSE_TIME;
const FIELD_STATUS = TelemetryFields.STATUS;
const MS_PER_MINUTE = 60_000;
const MAX_MONTHS = config.graphMaxMonths;

interface TimeWindowSlot {
  responseTimes: number[];
  statuses: TelemetryStatus[];
}

type TelemetryPointSchema = Pick<
  TelemetryPointInfluxModel,
  "status" | "time" | "response_time"
>;

export const telemetryQueryServiceBuilder = (
  telemetryManager: TelemetryManager,
) => {
  return {
    async findStatistics({
      eserviceRecordId,
      pollingFrequency,
      startDate,
      endDate,
    }: {
      eserviceRecordId: number;
      pollingFrequency: number;
      startDate?: string;
      endDate?: string;
    }): Promise<TelemetryPoint[]> {
      const { startIso, endIso } = normalizeDateRange(startDate, endDate);
      const windowMinutes =
        pollingFrequency * calculateMonths(startIso, endIso);
      const timeWindowSizeMs = windowMinutes * MS_PER_MINUTE;

      const query = buildFluxQuery(eserviceRecordId, startIso, endIso);
      const raw = await telemetryManager.query<TelemetryPointSchema>(query);

      return aggregateIntoTimeWindows(raw, timeWindowSizeMs, startIso, endIso);
    },
  };
};

export type TelemetryQueryService = ReturnType<
  typeof telemetryQueryServiceBuilder
>;

const calculateMonths = (start: string, end: string): number => {
  const days = timeBetween(start, end, DateUnit.DAYS);
  return Math.min(1 + Math.round(days / 30), MAX_MONTHS);
};

const buildFluxQuery = (
  eserviceId: number,
  startTime?: string,
  endTime?: string,
): string => {
  const startRange = startTime
    ? `time(v: "${changeDateFormat(startTime, TimeFormat.ISO_8601)}")`
    : `-24h`;
  const stopRange = endTime
    ? `time(v: "${changeDateFormat(
        new Date(new Date(endTime).getTime() + 1).toISOString(),
        TimeFormat.ISO_8601,
      )}")`
    : `now()`;

  return `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startRange}, stop: ${stopRange})
      |> filter(fn: (r) => r._measurement == "${MEASUREMENT}" and r.eservice_record_id == "${eserviceId}")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> keep(columns: ["_time", "${FIELD_RESPONSE_TIME}", "${FIELD_STATUS}"])
      |> map(fn: (r) => ({
          time: r._time,
          response_time: if exists r.${FIELD_RESPONSE_TIME} then r.${FIELD_RESPONSE_TIME} else 0.0,
          status: if exists r.${FIELD_STATUS} then r.${FIELD_STATUS} else "${TelemetryFailureStatus.Values.N_D}"
        }))
      |> sort(columns: ["time"])
  `.trim();
};

const aggregateIntoTimeWindows = (
  telemetryPoints: TelemetryPointSchema[],
  timeWindowSizeMs: number,
  rangeStartIso: string,
  rangeEndIso: string,
): TelemetryPoint[] => {
  const windows: Record<string, TimeWindowSlot> = {};

  const rangeStart = new Date(rangeStartIso);
  const rangeEnd = new Date(rangeEndIso);

  for (const telemetry of telemetryPoints) {
    const timestamp = new Date(telemetry.time);
    if (isNaN(timestamp.getTime())) continue;

    const windowStartIso = new Date(
      Math.floor(timestamp.getTime() / timeWindowSizeMs) * timeWindowSizeMs,
    ).toISOString();

    windows[windowStartIso] ??= { responseTimes: [], statuses: [] };

    if (telemetry.response_time > 0) {
      windows[windowStartIso].responseTimes.push(telemetry.response_time);
    }

    if (telemetry.status) {
      windows[windowStartIso].statuses.push(
        telemetry.status as TelemetryStatus,
      );
    }
  }

  const aggregated: TelemetryPoint[] = [];

  for (
    let windowStart = alignToWindowStart(rangeStart, timeWindowSizeMs);
    windowStart <= rangeEnd;
    windowStart = new Date(windowStart.getTime() + timeWindowSizeMs)
  ) {
    const windowStartIso = windowStart.toISOString();

    aggregated.push(
      windows[windowStartIso]
        ? createStatisticFromWindow(windowStartIso, windows[windowStartIso])
        : {
            time: changeDateFormat(windowStartIso, TimeFormat.ISO_8601),
            responseTime: null,
            status: TelemetryFailureStatus.Values.N_D,
          },
    );
  }

  return TelemetryPoint.array().parse(aggregated);
};

const alignToWindowStart = (date: Date, windowSizeMs: number): Date => {
  const d = new Date(date);
  const minutes = d.getUTCMinutes();
  const windowMinutes = windowSizeMs / MS_PER_MINUTE;

  // Align timestamp to the lower boundary of the time window
  // Example: 10:23 -> 10:15 for a 15-minute time window
  d.setUTCMinutes(Math.floor(minutes / windowMinutes) * windowMinutes, 0, 0);
  return d;
};

const createStatisticFromWindow = (
  key: string,
  slot: TimeWindowSlot,
): TelemetryPoint => {
  const avg =
    slot.responseTimes.length > 0
      ? slot.responseTimes.reduce((a, b) => a + b, 0) /
        slot.responseTimes.length
      : null;

  return {
    time: changeDateFormat(key, TimeFormat.ISO_8601),
    responseTime: avg !== null ? Math.round(avg) : null,
    status: getDominantStatus(slot.statuses),
  };
};

const getDominantStatus = (statuses: TelemetryStatus[]): TelemetryStatus => {
  if (statuses.length === 0) return TelemetryFailureStatus.Values.N_D;

  const counts: Partial<Record<TelemetryStatus, number>> = {};
  for (const s of statuses) {
    counts[s] = (counts[s] ?? 0) + 1;
  }

  const [status] = Object.entries(counts).reduce((a, b) =>
    b[1] > a[1] ? b : a,
  );

  return match(status as TelemetryStatus)
    .with("OK", () => TelemetrySuccessStatus.Values.OK)
    .with("KO", () => TelemetryFailureStatus.Values.KO)
    .with("N_D", () => TelemetryFailureStatus.Values.N_D)
    .exhaustive();
};
