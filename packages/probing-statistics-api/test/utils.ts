import { QueryResponse } from "@aws-sdk/client-timestream-query";

export const mockTimestreamResponseQuery: QueryResponse = {
  ColumnInfo: [
    { Name: "time", Type: { ScalarType: "TIMESTAMP" } },
    { Name: "status", Type: { ScalarType: "VARCHAR" } },
    { Name: "response_time", Type: { ScalarType: "INTEGER" } },
  ],
  QueryId: "AEBQEANS7FHWTWXJ2TMW2SOV5ZXML72NAFHBFEFY7F2PVRNVVXQ4OADG53EJV4A",
  QueryStatus: {
    CumulativeBytesMetered: 10000000,
    CumulativeBytesScanned: 148,
    ProgressPercentage: 100,
  },
  Rows: [
    {
      Data: [
        { ScalarValue: "2024-03-13 21:00:00.000000000" },
        { ScalarValue: "OK" },
        { ScalarValue: "50" },
      ],
    },
    {
      Data: [
        { ScalarValue: "2024-03-13 21:03:00.000000000" },
        { ScalarValue: "KO" },
        { ScalarValue: "16" },
      ],
    },
    {
      Data: [
        { ScalarValue: "2024-03-13 21:06:00.000000000" },
        { ScalarValue: "KO" },
        { ScalarValue: "16" },
      ],
    },
    {
      Data: [
        { ScalarValue: "2024-03-13 21:09:00.000000000" },
        { ScalarValue: "N_D" },
        { ScalarValue: undefined },
      ],
    },
    {
      Data: [
        { ScalarValue: "2024-03-13 21:12:00.000000000" },
        { ScalarValue: "N_D" },
        { ScalarValue: undefined },
      ],
    },
  ],
};
