import { config } from "./config.js";
import { genericLogger } from "pagopa-interop-probing-commons";
import {
  TimestreamQueryClient,
  QueryRequest,
  QueryCommand,
  QueryResponse,
  ColumnInfo,
  Datum,
  Row,
} from "@aws-sdk/client-timestream-query";
import {
  missingScalarValueTelemetry,
  queryTimestreamError,
} from "../model/domain/errors.js";
import {
  StatisticColumnNames,
  StatisticContent,
  TelemetryStatus,
} from "../model/statistic.js";
import { changeDateFormat, TimeFormat } from "./date.js";
import { match } from "ts-pattern";

export const timestreamQueryClientBuilder = () => {
  const client: TimestreamQueryClient = new TimestreamQueryClient({
    region: config.awsRegion,
  });

  return {
    async query(queryString: string): Promise<QueryResponse[]> {
      try {
        let nextToken: string | undefined = undefined;
        const queryResponses: QueryResponse[] = [];

        do {
          const queryRequest: QueryRequest = {
            QueryString: queryString,
            NextToken: nextToken,
          };

          const command = new QueryCommand(queryRequest);
          const queryResponse = await client.send(command);
          queryResponses.push(queryResponse);

          nextToken = queryResponse.NextToken;
        } while (nextToken !== undefined);

        return queryResponses;
      } catch (error) {
        genericLogger.error(
          `An error occurred while attempting to retrieve records from Timestream: ${error}`,
        );
        throw queryTimestreamError(`${error}`);
      }
    },
  };
};

export type TimestreamQueryClientHandler = ReturnType<
  typeof timestreamQueryClientBuilder
>;

export function parseQueryResult(response: QueryResponse): StatisticContent[] {
  const content: StatisticContent[] = [];
  const columnInfo: ColumnInfo[] = response.ColumnInfo || [];
  const rows: Row[] = response.Rows || [];

  if (rows && columnInfo) {
    for (const row of rows) {
      content.push(parseRow(columnInfo, row));
    }
  }

  return content;
}

function parseRow(columnInfo: ColumnInfo[], row: Row): StatisticContent {
  const data: Datum[] = row.Data || [];
  const rowData: StatisticContent = {} as StatisticContent;

  for (let j = 0; j < data.length; j++) {
    const datum: Datum = data[j];
    const info: ColumnInfo = columnInfo[j];
    const columnName = `${info.Name?.toLowerCase()}`;
    const columnValue = datum.ScalarValue;

    match(columnName as StatisticColumnNames)
      .with("time", () => {
        if (!columnValue) throw missingScalarValueTelemetry(columnName);

        rowData.time = changeDateFormat(
          columnValue,
          TimeFormat.YY_MM_DD_HH_MM_SS,
        );
      })
      .with("status", () => {
        if (!columnValue) throw missingScalarValueTelemetry(columnName);

        rowData.status = columnValue as TelemetryStatus;
      })
      .with("response_time", () => {
        rowData.responseTime =
          !isNaN(Number(columnValue)) && !datum.NullValue
            ? Number(columnValue)
            : null;
      })
      .exhaustive();
  }

  return rowData;
}
