import { ZodError } from "zod";
import { AxiosError } from "axios";
import { ApplicationError, InternalError } from "pagopa-interop-probing-models";

export const errorCodes = {
  apiUpdateResponseReceivedError: "API_UPDATE_RESPONSE_RECEIVED_ERROR",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export function apiUpdateResponseReceivedError(
  eserviceRecordId: number,
  error: unknown,
): InternalError<ErrorCodes> {
  const status = (error as AxiosError).response?.status;
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new ApplicationError({
    ...(status && { status }),
    detail: `Error updating eService response received with eserviceRecordId: ${eserviceRecordId}. Details: ${error} - ${zodiosErrorDetails}`,
    code: "apiUpdateResponseReceivedError",
    title: "EService service updateResponseReceived error",
  });
}
