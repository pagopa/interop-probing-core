import {
  InternalError,
  parseErrorMessage,
} from "pagopa-interop-probing-models";

type TelemetryErrorCode =
  | "telemetryWriteError"
  | "telemetryQueryError"
  | "telemetryCleanBucketError";

export class TelemetryError extends InternalError<TelemetryErrorCode> {
  constructor({ code, detail }: { code: TelemetryErrorCode; detail: string }) {
    super({ code, detail });
  }
}

export function telemetryWriteError(
  telemetry: object,
  error: unknown,
): TelemetryError {
  return new TelemetryError({
    code: "telemetryWriteError",
    detail: `Error writing telemetry "${JSON.stringify(telemetry)}". Details: ${parseErrorMessage(
      error,
    )}`,
  });
}

export function telemetryQueryError(
  query: string,
  error: unknown,
): TelemetryError {
  return new TelemetryError({
    code: "telemetryQueryError",
    detail: `Error executing telemetry query "${JSON.stringify(query)}". Details: ${parseErrorMessage(
      error,
    )}`,
  });
}

export function telemetryCleanBucketError(error: unknown): TelemetryError {
  return new TelemetryError({
    code: "telemetryCleanBucketError",
    detail: `Error executing telemetry clean up bucket. Details: ${parseErrorMessage(
      error,
    )}`,
  });
}
