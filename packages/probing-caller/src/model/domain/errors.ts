import { ZodError } from "zod";
import { InternalError } from "pagopa-interop-probing-models";

export const errorCodes = {
  callProbingEndpointError: "CALL_PROBING_ENDPOINT_ERROR",
  buildJWTError: "BUILD_JWT_ERROR",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export function callProbingEndpointError(
  detail: string,
  error: unknown,
): InternalError<ErrorCodes> {
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new InternalError({
    detail: `${detail} ${zodiosErrorDetails}`,
    code: "callProbingEndpointError",
  });
}

export function buildJWTError(detail: string): InternalError<ErrorCodes> {
  return new InternalError({
    detail: `${detail}`,
    code: "buildJWTError",
  });
}
