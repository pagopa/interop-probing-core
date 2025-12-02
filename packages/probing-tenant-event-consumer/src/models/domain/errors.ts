import { InternalError } from "pagopa-interop-probing-models";

export const errorCodes = {
  errorDeleteTenant: "ERROR_DELETE_TENANT",
  errorSaveTenant: "ERROR_SAVE_TENANT",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export function errorDeleteTenant(
  tenantId: string,
  error: unknown,
): InternalError<ErrorCodes> {
  return new InternalError({
    detail: `Error deleting tenant with tenantId: ${tenantId}. Details: ${error}`,
    code: "errorDeleteTenant",
  });
}

export function errorSaveTenant(
  tenantId: string,
  error: unknown,
): InternalError<ErrorCodes> {
  return new InternalError({
    detail: `Error saving tenant with tenantId: ${tenantId}. Details: ${error}`,
    code: "errorSaveTenant",
  });
}
