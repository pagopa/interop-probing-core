import {
  ApiFilteredStatisticsEservicesQuery,
  ApiStatisticsEservicesQuery,
  ApiStatisticsEservicesParams,
  ApiFilteredStatisticsEservicesParams,
  ApiFilteredStatisticsEservicesResponse,
  ApiStatisticsEservicesResponse,
} from "../../src/model/types.js";
import { TimestreamService } from "./timestreamService.js";
import { config } from "../utilities/config.js";
import {
  FailureContent,
  PercentageContent,
  PerformanceContent,
  StatisticContent,
  TelemetryStatus,
  telemetryFailureStatus,
  telemetryStatus,
} from "../model/statistic.js";
import {
  DateUnit,
  changeDateFormat,
  timeBetween,
  timeFormat,
  timeUnitToMS,
  truncatedTo,
} from "../utilities/date.js";


export const statisticsServiceBuilder = (
  timestreamService: TimestreamService
) => {
  return {
    async statisticsEservices(
      params: ApiStatisticsEservicesParams,
      query: ApiStatisticsEservicesQuery
    ): Promise<ApiStatisticsEservicesResponse> {
      const content = await timestreamService.findStatistics({
        eserviceRecordId: params.eserviceRecordId,
        pollingFrequency: query.pollingFrequency,
      });

      return calculatePerformances(content, null, null);
    },
    async filteredStatisticsEservices(
      params: ApiFilteredStatisticsEservicesParams,
      query: ApiFilteredStatisticsEservicesQuery
    ): Promise<ApiFilteredStatisticsEservicesResponse> {
      const content = await timestreamService.findStatistics({
        eserviceRecordId: params.eserviceRecordId,
        pollingFrequency: query.pollingFrequency,
        startDate: query.startDate,
        endDate: query.endDate,
      });

      return calculatePerformances(content, query.endDate, query.startDate);
    },
  };
};

export type StatisticsService = ReturnType<typeof statisticsServiceBuilder>;

function calculatePerformances(
  values: StatisticContent[],
  startDate: string | null,
  endDate: string | null
): ApiStatisticsEservicesResponse {
  const failures: FailureContent[] = [];
  const performances: PerformanceContent[] = [];

  if (values.length > 0) {
    let granularityPerWeeks: number = 1;

    if (startDate && endDate) {
      // Group the telemetries in intervals of 6 hours for every week except for the first week,
      // in which the telemetries are grouped for every hour
      granularityPerWeeks = timeBetween(startDate, endDate, DateUnit.WEEKS) * 6;
      if (granularityPerWeeks < 1) {
        granularityPerWeeks = 1;
      }
    }

    const now: Date = new Date();

    // Remove the minute and seconds from the date that will be used to group the telemetries
    let startDateZero: Date = truncatedTo(
      values[0].time,
      granularityPerWeeks !== 1 ? DateUnit.DAYS : DateUnit.HOURS
    );

    while (startDateZero.getTime() < now.getTime()) {
      const innerStartDateZero: number = startDateZero.getTime();
      const innerGranularity: number = granularityPerWeeks;

      const hourStatistic: StatisticContent[] = values.filter(
        (el: StatisticContent) => {
          const time: number = new Date(el.time).getTime();
          return (
            time <
              innerStartDateZero +
                timeUnitToMS(innerGranularity, DateUnit.HOURS) &&
            (time >= innerStartDateZero || time === innerStartDateZero)
          );
        }
      );

      const responseTimes = hourStatistic
        .filter((el: StatisticContent) => el.responseTime !== null)
        .map((el) => el.responseTime!);

      let average: number =
        responseTimes.reduce((sum, value) => sum + value, 0) /
          responseTimes.length || 0.0;

      const numberOfFailures: number = hourStatistic.filter(
        (el) => el.status !== telemetryStatus.ok
      ).length;

      // if the point contains a fraction of KO and N/D which is bigger of the one
      // calculated via the performanceTolerance, the line gets broken
      if (
        (hourStatistic.length < config.graphPerformanceTolerance &&
          numberOfFailures > 0) ||
        (hourStatistic.length >= config.graphPerformanceTolerance &&
          numberOfFailures >=
            hourStatistic.length / config.graphPerformanceTolerance)
      ) {
        average = 0.0;
      }

      performances.push({
        responseTime: average,
        time: changeDateFormat(
          new Date(startDateZero).toISOString(),
          timeFormat.YY_MM_DD_HH_MM_SS
        ),
      });

      failures.push(...calculateFailures(hourStatistic));

      startDateZero = new Date(
        startDateZero.getTime() +
          timeUnitToMS(granularityPerWeeks, DateUnit.HOURS)
      );
    }
  }

  return {
    performances,
    failures,
    percentages: calculatePercentages(values),
  };
}

function calculateFailures(values: StatisticContent[]): FailureContent[] {
  const failures: FailureContent[] = [];

  for (const status of Object.values(telemetryFailureStatus)) {
    const numberOfFailures: number = values.filter(
      (el) => el.status === status
    ).length;

    // If the partition contains a bigger fraction of KO or N/D which is bigger of the one
    // calculated via the failureTolerance, we create a failure point for the given status
    if (
      (values.length < config.graphFailureTolerance && numberOfFailures > 0) ||
      (values.length >= config.graphFailureTolerance &&
        numberOfFailures >= values.length / config.graphFailureTolerance)
    ) {
      const failure: FailureContent = {
        status: status,
        time: values[0].time,
      };
      failures.push(failure);
    }
  }
  return failures;
}

function calculatePercentages(values: StatisticContent[]): PercentageContent[] {
  const percentages: PercentageContent[] = [];
  const fractions: Map<TelemetryStatus, number> = new Map();

  for (const value of values) {
    if (value.status) {
      fractions.set(value.status, (fractions.get(value.status) || 0) + 1);
    }
  }

  for (const status of Object.values(telemetryStatus)) {
    const key = status as TelemetryStatus;
    const count = fractions.get(key) || 0;
    const value = (count * 100) / values.length;
    percentages.push({ status, value });
  }

  return percentages;
}
