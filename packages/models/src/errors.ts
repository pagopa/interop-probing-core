/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";

export class ApiError<T> extends Error {
  public code: T;
  public title: string;
  public detail: string;
  public correlationId?: string;

  constructor({
    code,
    title,
    detail,
    correlationId,
  }: {
    code: T;
    title: string;
    detail: string;
    correlationId?: string;
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
    this.correlationId = correlationId;
  }
}

export type ProblemError = {
  code: string;
  detail: string;
};

export type Problem = {
  type: string;
  status: number;
  title: string;
  correlationId?: string;
  detail: string;
  errors: ProblemError[];
};

export function makeApiProblemBuilder<T extends string>(errors: {
  [K in T]: string;
}): (
  error: unknown,
  httpMapper: (apiError: ApiError<T | CommonErrorCodes>) => number
) => Problem {
  const allErrors = { ...errorCodes, ...errors };
  return (error, httpMapper) => {
    const makeProblem = (
      httpStatus: number,
      { code, title, detail, correlationId }: ApiError<T | CommonErrorCodes>
    ): Problem => ({
      type: "about:blank",
      title,
      status: httpStatus,
      detail,
      correlationId,
      errors: [
        {
          code: allErrors[code],
          detail,
        },
      ],
    });

    return match<unknown, Problem>(error)
      .with(P.instanceOf(ApiError<T | CommonErrorCodes>), (error) =>
        makeProblem(httpMapper(error), error)
      )
      .otherwise(() => makeProblem(500, genericError("Unexpected error")));
  };
}

const errorCodes = {
  genericError: "9991",
} as const;

export type CommonErrorCodes = keyof typeof errorCodes;

export function genericError(details: string): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: details,
    code: "genericError",
    title: "Unexpected error",
  });
}