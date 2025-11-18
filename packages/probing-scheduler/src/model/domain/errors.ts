import { ZodError } from "zod";
import { AxiosError } from "axios";
import { InternalError } from "pagopa-interop-probing-models";

export const errorCodes = {
  apiGetEservicesReadyForPollingError:
    "API_GET_ESERVICES_READY_FOR_POLLING_ERROR",
  apiUpdateLastRequestError: "API_UPDATE_LAST_REQUEST_ERROR",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export function apiGetEservicesReadyForPollingError(
  error: unknown,
): InternalError<ErrorCodes> {
  const status = (error as AxiosError).response?.status;
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new InternalError({
    ...(status && { status }),
    detail: `Error API getEservicesReadyForPolling. Details: ${error} - ${zodiosErrorDetails}`,
    code: "apiGetEservicesReadyForPollingError",
  });
}

export function apiUpdateLastRequestError(
  eserviceRecordId: number,
  error: unknown,
): InternalError<ErrorCodes> {
  const status = (error as AxiosError).response?.status;
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new InternalError({
    ...(status && { status }),
    detail: `Error API updateLastRequest for eserviceRecordId ${eserviceRecordId}. Details: ${error} - ${zodiosErrorDetails}`,
    code: "apiUpdateLastRequestError",
  });
}
