import { makeApiProblemBuilder, Problem } from "pagopa-interop-probing-models";
import { AxiosError } from "axios";

export const makeApiProblem = makeApiProblemBuilder({});

export const resolveOperationsApiClientProblem = (error: unknown): Problem => {
  const operationsApiProblem = Problem.safeParse(
    (error as AxiosError).response?.data
  );

  if (operationsApiProblem.success) {
    return operationsApiProblem.data;
  } else {
    return makeApiProblem(error, () => 500);
  }
};
