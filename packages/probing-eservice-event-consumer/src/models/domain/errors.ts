import { InternalError } from "pagopa-interop-probing-models";

export const errorCodes = {
  errorDeleteEservice: "ERROR_DELETE_ESERVICE",
  errorSaveEservice: "ERROR_SAVE_ESERVICE",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export function errorDeleteEservice(
  eserviceId: string,
  error: unknown,
): InternalError<ErrorCodes> {
  return new InternalError({
    detail: `Error deleting eService: ${eserviceId}. Details: ${error}`,
    code: "errorDeleteEservice",
  });
}

export function errorSaveEservice(
  eserviceId: string,
  producerId: string,
  error: unknown,
): InternalError<ErrorCodes> {
  return new InternalError({
    detail: `Error saving eService: ${eserviceId}, tenantId: ${producerId}. Details: ${error}`,
    code: "errorSaveEservice",
  });
}
