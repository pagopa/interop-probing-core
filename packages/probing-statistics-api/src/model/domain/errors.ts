import { makeApiProblemBuilder } from "pagopa-interop-probing-models";

export const errorCodes = {};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);
