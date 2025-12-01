import { ApiError, makeApiProblemBuilder } from "pagopa-interop-probing-models";

export const errorCodes = {
  invalidFilterDate: "INVALID_FILTER_DATE",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function invalidFilterDate(detail: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail,
    code: "invalidFilterDate",
    title: "Invalid filter date",
  });
}
