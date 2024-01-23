import { ApiError, makeApiProblemBuilder, } from "pagopa-interop-probing-models";

export const errorCodes = {
  eServiceNotFound: "0007",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);
 
export function eServiceMainDataByRecordIdNotFound(identifier: number): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService main data by record Id ${identifier} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}

export function eServiceProbingDataByRecordIdNotFound(identifier: number): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService probing data by record Id ${identifier} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}



