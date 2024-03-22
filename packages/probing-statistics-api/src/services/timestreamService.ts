import { StatisticContent } from "../model/statistic.js";
import { config } from "../utilities/config.js";
import { changeDateFormat, TimeFormat } from "../utilities/date.js";
import {
  TimestreamQueryClientHandler,
  parseQueryResult,
} from "../utilities/timestreamQueryClientHandler.js";

export const timestreamServiceBuilder = (
  timestreamQueryClient: TimestreamQueryClientHandler
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
    }): Promise<StatisticContent[]> {
      let months: number = 1;

      if (startDate && endDate) {
        const daysDifference: number = Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        months += Math.round(daysDifference / 30);
        if (months > config.graphMaxMonths) {
          months = config.graphMaxMonths;
        }
      }

      const queryString: string = buildQueryString(
        months,
        eserviceRecordId,
        pollingFrequency,
        startDate,
        endDate
      );

      const queryResponseIterator = await timestreamQueryClient.query(
        queryString
      );
      const content: StatisticContent[] = [];
      for await (const queryResponse of queryResponseIterator) {
        content.push(...parseQueryResult(queryResponse));
      }
      return content;
    },
  };
};

export type TimestreamService = ReturnType<typeof timestreamServiceBuilder>;

function buildQueryString(
  months: number,
  eserviceRecordId: number,
  pollingFrequency: number,
  startDate?: string,
  endDate?: string
): string {
  const startTime: string = startDate
    ? ` '${changeDateFormat(startDate, TimeFormat.YY_MM_DD_HH_MM)}'`
    : "ago(1d) ";
  const endTime: string = endDate
    ? ` '${changeDateFormat(endDate, TimeFormat.YY_MM_DD_HH_MM)}'`
    : "now() ";
  
  return `
        WITH binned_timeseries AS (
          SELECT binned_timestamp, status, avg_response_time
            FROM (
              SELECT 
                *, 
                row_number() over (partition by binned_timestamp order by binned_timestamp desc, num_status desc) as seqnum 
              FROM (
                SELECT 
                  eservice_record_id, 
                  status, 
                  bin(time, ${pollingFrequency * months}m) as binned_timestamp, 
                  cast(avg(response_time) as int) as avg_response_time, 
                  count(status) as num_status
                FROM 
                  ${config.timestreamDatabase}.${config.timestreamTable}
                WHERE 
                  time between ${startTime} and ${endTime} and 
                  eservice_record_id = '${eserviceRecordId}' 
                GROUP BY 
                  eservice_record_id, 
                  bin(time, ${pollingFrequency * months}m), 
                  status
              )
            ) 
            WHERE seqnum = 1 
            ORDER BY binned_timestamp
        ), 
        interpolated_timeseries AS (
          SELECT 
            INTERPOLATE_FILL(
              CREATE_TIME_SERIES(binned_timestamp, status),
              SEQUENCE(min(binned_timestamp), max(binned_timestamp), ${
                pollingFrequency * months
              }m), 
              'N/D'
            ) AS interpolated_status 
          FROM 
            binned_timeseries
        )
        SELECT 
          time, 
          value as status, 
          avg_response_time as response_time
        FROM 
          interpolated_timeseries 
        CROSS JOIN UNNEST(interpolated_status)
        LEFT JOIN 
          binned_timeseries s ON s.binned_timestamp = time
        ORDER BY time
      `;
}
