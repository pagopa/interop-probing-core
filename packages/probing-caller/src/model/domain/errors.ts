import { InternalError } from "pagopa-interop-probing-models";

export const errorCodes = {
  buildJWTError: "BUILD_JWT_ERROR",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export function buildJWTError(detail: string): InternalError<ErrorCodes> {
  return new InternalError({
    detail: `${detail}`,
    code: "buildJWTError",
  });
}
