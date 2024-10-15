import { ApiError, makeApiProblemBuilder } from "pagopa-interop-probing-models";

export const errorCodes = {
  eServiceNotFound: "ESERVICE_NOT_FOUND",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function eServiceNotFound(
  eserviceId: string,
  versionId: string,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService by ${eserviceId} version ${versionId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}

export function eServiceMainDataByRecordIdNotFound(
  eserviceRecordId: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService main data by eserviceRecordId ${eserviceRecordId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}

export function eServiceProbingDataByRecordIdNotFound(
  eserviceRecordId: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService probing data by eserviceRecordId ${eserviceRecordId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}
