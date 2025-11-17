import {
  ApiFilteredStatisticsEservicesQuery,
  ApiStatisticsEservicesQuery,
  ApiStatisticsEservicesParams,
  ApiFilteredStatisticsEservicesParams,
  ApiFilteredStatisticsEservicesResponse,
  ApiStatisticsEservicesResponse,
} from "../../src/model/types.js";
import { TelemetryQueryService } from "./telemetryQueryService.js";
import { config } from "../utilities/config.js";
import {
  FailureContent,
  PercentageContent,
  PerformanceContent,
  TelemetryPoint,
  TelemetryFailureStatus,
  TelemetryStatus,
  telemetryFailureStatus,
  telemetryStatus,
} from "pagopa-interop-probing-models";
import {
  DateUnit,
  changeDateFormat,
  timeBetween,
  TimeFormat,
  timeUnitToMS,
  truncatedTo,
} from "../utilities/date.js";

export const statisticsServiceBuilder = (
  telemetryQueryService: TelemetryQueryService,
) => {
  return {
    async getEserviceStatistics(
      params: ApiStatisticsEservicesParams,
      query: ApiStatisticsEservicesQuery,
    ): Promise<ApiStatisticsEservicesResponse> {
      const content = await telemetryQueryService.findStatistics({
        eserviceRecordId: params.eserviceRecordId,
        pollingFrequency: query.pollingFrequency,
      });

      return calculatePerformances(content, null, null);
    },
    async getFilteredEserviceStatistics(
      params: ApiFilteredStatisticsEservicesParams,
      query: ApiFilteredStatisticsEservicesQuery,
    ): Promise<ApiFilteredStatisticsEservicesResponse> {
      const content = await telemetryQueryService.findStatistics({
        eserviceRecordId: params.eserviceRecordId,
        pollingFrequency: query.pollingFrequency,
        startDate: query.startDate,
        endDate: query.endDate,
      });

      return calculatePerformances(content, query.startDate, query.endDate);
    },
  };
};

export type StatisticsService = ReturnType<typeof statisticsServiceBuilder>;

function calculatePerformances(
  values: TelemetryPoint[],
  startDate: string | null,
  endDate: string | null,
): ApiStatisticsEservicesResponse {
  const failures: FailureContent[] = [];
  const performances: PerformanceContent[] = [];

  if (values.length > 0) {
    let granularityPerWeeks: number = 1;

    if (startDate && endDate) {
      // Convert the selected time window into a weekly-based granularity.
      // Each week corresponds to a 6-hour time window.
      //
      // Example:
      //   Time range = 3 weeks
      //   -> granularityPerWeeks = 3 * 6 = 18-hour time window
      //
      // This prevents generating thousands of very small time windows when
      // the selected range is very large (e.g., several months).
      granularityPerWeeks = timeBetween(startDate, endDate, DateUnit.WEEKS) * 6;
      if (granularityPerWeeks < 1) {
        granularityPerWeeks = 1;
      }
    }

    const minTime = Math.min(...values.map((v) => new Date(v.time).getTime()));

    // Derive the time window size from the smallest telemetry spacing when
    // weekly granularity is disabled. This preserves fine-grained data and
    // avoids diluting real OK/KO points inside overly large hourly windows.
    let stepMsFromValues = timeUnitToMS(1, DateUnit.HOURS);

    if (values.length > 1) {
      const timestamps = values
        .map((v) => new Date(v.time).getTime())
        .sort((a, b) => a - b);

      const diffs: number[] = [];

      for (let i = 1; i < timestamps.length; i++) {
        const diff = timestamps[i] - timestamps[i - 1];
        if (diff > 0) diffs.push(diff);
      }

      if (diffs.length > 0) {
        // Identify the highest resolution present in the data.
        //
        // Example:
        //   Samples at: 10:00, 10:05, 10:20
        //   Differences: 5min, 15min -> smallestDiff = 5min
        //
        // The time window size will then be at least 5 minutes,
        // but never below the 1‑minute minimum.
        const smallestDiff = Math.min(...diffs);
        stepMsFromValues = Math.max(60_000, smallestDiff);
      }
    }

    const timeWindowSizeMs =
      granularityPerWeeks === 1
        ? stepMsFromValues
        : timeUnitToMS(granularityPerWeeks, DateUnit.HOURS);

    let startDateZero: Date;
    if (granularityPerWeeks !== 1) {
      // Weekly granularity -> align to the beginning of the day.
      // Example:
      //   minTime = 2025‑03‑03T10:23Z
      //   -> 2025‑03‑03T00:00Z
      startDateZero = truncatedTo(
        new Date(minTime).toISOString(),
        DateUnit.DAYS,
      );
    } else {
      // Hour-based granularity -> align to the start of the hour.
      startDateZero = new Date(minTime);
      if (timeWindowSizeMs >= timeUnitToMS(1, DateUnit.HOURS)) {
        startDateZero = truncatedTo(
          startDateZero.toISOString(),
          DateUnit.HOURS,
        );
      }
    }

    // Align sub‑hour windows to the nearest lower boundary.
    //
    // Example (15‑minute window):
    //   10:23 -> 10:15
    //
    if (timeWindowSizeMs < timeUnitToMS(1, DateUnit.HOURS)) {
      const windowMinutes = timeWindowSizeMs / 60_000;
      const aligned = new Date(startDateZero);
      const currentMinutes = aligned.getUTCMinutes();
      const alignedMinutes =
        Math.floor(currentMinutes / windowMinutes) * windowMinutes;
      aligned.setUTCMinutes(alignedMinutes, 0, 0);
      startDateZero = aligned;
    }

    const loopEndTime = endDate
      ? new Date(endDate).getTime()
      : new Date().getTime();

    while (startDateZero.getTime() < loopEndTime) {
      const windowStart = startDateZero.getTime();
      const windowEnd = windowStart + timeWindowSizeMs;

      const windowSamples: TelemetryPoint[] = values.filter((el) => {
        const time = new Date(el.time).getTime();
        return time >= windowStart && time < windowEnd;
      });

      const responseTimes = windowSamples
        .filter((el: TelemetryPoint) => el.responseTime !== null)
        .map((el) => el.responseTime!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

      let average: number =
        responseTimes.reduce((sum, v) => sum + v, 0) / responseTimes.length ||
        0.0;

      const numberOfFailures = windowSamples.filter(
        (el) => el.status !== telemetryStatus.ok,
      ).length;

      // Apply performanceTolerance: if the fraction of KO/N_D samples inside the
      // current time window exceeds the allowed threshold, the performance value is
      // forced to 0.
      //
      // Example:
      //   Window contains 12 samples
      //   Tolerance = 4
      //   Threshold = 12 / 4 = 3
      //   Failures = 4 -> (4 > 3) -> performance = 0
      //
      // A strict '>' comparison avoids invalidating windows that sit exactly at the
      // threshold.
      if (
        (windowSamples.length < config.graphPerformanceTolerance &&
          numberOfFailures > 0) ||
        (windowSamples.length >= config.graphPerformanceTolerance &&
          numberOfFailures >
            windowSamples.length / config.graphPerformanceTolerance)
      ) {
        average = 0.0;
      }

      performances.push({
        responseTime: average,
        time: changeDateFormat(
          new Date(startDateZero),
          TimeFormat.YY_MM_DD_HH_MM_SS,
        ),
      });

      failures.push(...calculateFailures(windowSamples));

      // Advance to the next time window.
      //
      // Example:
      //   Current window: 10:15
      //   Window size: 15 minutes
      //   -> Next window: 10:30
      const advanceMs =
        granularityPerWeeks === 1
          ? timeWindowSizeMs
          : timeUnitToMS(granularityPerWeeks, DateUnit.HOURS);

      startDateZero = new Date(startDateZero.getTime() + advanceMs);
    }
  }

  return {
    performances,
    failures,
    percentages: calculatePercentages(values),
  };
}

function calculateFailures(values: TelemetryPoint[]): FailureContent[] {
  const failures: FailureContent[] = [];

  for (const status of Object.values(telemetryFailureStatus)) {
    const numberOfFailures: number = values.filter(
      (el) => el.status === status,
    ).length;

    if (status === TelemetryFailureStatus.Values.N_D) {
      // N_D represents missing data. If the time window contains at least one
      // measured status (OK or KO), then N_D must not produce a failure event.
      const containsMeasuredStatus = values.some(
        (point) =>
          point.status && point.status !== TelemetryFailureStatus.Values.N_D,
      );

      if (containsMeasuredStatus) {
        continue;
      }
    }

    // Apply failureTolerance: generate a failure event when the number of KO or N_D
    // points exceeds the tolerance threshold. Pure N_D failures are skipped when the
    // time window contains any measured OK or KO status.
    if (
      (values.length < config.graphFailureTolerance && numberOfFailures > 0) ||
      (values.length >= config.graphFailureTolerance &&
        numberOfFailures >= values.length / config.graphFailureTolerance)
    ) {
      const failure: FailureContent = {
        status: status,
        time: changeDateFormat(values[0].time, TimeFormat.YY_MM_DD_HH_MM_SS),
      };
      failures.push(failure);
    }
  }
  return failures;
}

function calculatePercentages(values: TelemetryPoint[]): PercentageContent[] {
  const percentages: PercentageContent[] = [];
  const fractions: Map<TelemetryStatus, number> = new Map();

  for (const value of values) {
    if (value.status) {
      fractions.set(value.status, (fractions.get(value.status) || 0) + 1);
    }
  }

  for (const status of Object.values(telemetryStatus)) {
    const count = fractions.get(status) || 0;
    const value = (count * 100) / values.length;
    percentages.push({ status, value });
  }

  return percentages;
}
