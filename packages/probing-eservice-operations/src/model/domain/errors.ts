import { ApiError, makeApiProblemBuilder } from "pagopa-interop-probing-models";

export const errorCodes = {
  eServiceNotFound: "0007",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);
 
export function eServiceNotFound(eServiceId: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService ${eServiceId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}