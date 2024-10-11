import { ApiError, makeApiProblemBuilder } from "pagopa-interop-probing-models";

export const errorCodes = {
  missingScalarValueTelemetry: "MISSING_SCALAR_VALUE_TELEMETRY",
  queryTimestreamError: "QUERY_TIMESTREAM_ERROR",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function missingScalarValueTelemetry(
  columnName: string,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Missing Telemetry ScalarValue for ${columnName} column`,
    code: "missingScalarValueTelemetry",
    title: "Missing ScalarValue Telemetry",
  });
}

export function queryTimestreamError(detail: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `${detail}`,
    code: "queryTimestreamError",
    title: "Timestream record query failed",
  });
}
