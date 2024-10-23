/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";
import { z } from "zod";

export const ProblemError = z.object({
  code: z.string(),
  detail: z.string(),
});

export const Problem = z.object({
  type: z.string(),
  status: z.number(),
  title: z.string(),
  correlationId: z.string().optional(),
  detail: z.string(),
  errors: z.array(ProblemError),
});

export type Problem = z.infer<typeof Problem>;
export class ApiError<T> extends Error {
  public code: T;
  public title: string;
  public detail: string;
  public errors: Array<{ code: T; detail: string }>;
  public correlationId?: string;

  constructor({
    code,
    title,
    detail,
    correlationId,
    errors,
  }: {
    code: T;
    title: string;
    detail: string;
    correlationId?: string;
    errors?: Error[];
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
    this.correlationId = correlationId;
    this.errors =
      errors && errors.length > 0
        ? errors.map((e) => ({ code, detail: e.message }))
        : [{ code, detail }];
  }
}

export class InternalError<T> extends Error {
  public code: T;
  public detail: string;

  constructor({ code, detail }: { code: T; detail: string }) {
    super(detail);
    this.code = code;
    this.detail = detail;
  }
}

export class ApplicationError<T> extends Error {
  public code: T;
  public title: string;
  public detail: string;
  public status?: number;

  constructor({
    code,
    title,
    detail,
    status,
  }: {
    code: T;
    title: string;
    detail: string;
    status?: number;
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
    if (status) this.status = status;
  }
}

export class AppError extends ApplicationError<string> {
  constructor({
    code,
    title,
    detail,
    status,
  }: {
    code: string;
    title: string;
    detail: string;
    status?: number;
  }) {
    super({ code, title, detail, ...(status && { status }) });
  }
}

export const makeAppErrorLogString = (
  appError: AppError,
  originalError: unknown,
): string => {
  return `- title: ${appError.title} - detail: ${appError.detail} - original error: ${originalError}`;
};

export const makeProblemLogString = (
  problem: Problem,
  originalError: unknown,
): string => {
  const errorsString = problem.errors.map((e) => e.detail).join(" - ");
  return `- title: ${problem.title} - detail: ${problem.detail} - errors: ${errorsString} - original error: ${originalError}`;
};

export type MakeApiProblemFn<T extends string> = (
  error: unknown,
  httpMapper: (apiError: ApiError<T | CommonErrorCodes>) => number,
  logger: { error: (message: string) => void; warn: (message: string) => void },
) => Problem;

export function makeApiProblemBuilder<T extends string>(errors: {
  [K in T]: string;
}): MakeApiProblemFn<T> {
  const allErrors = { ...errorCodes, ...errors };
  return (error, httpMapper, logger) => {
    const makeProblem = (
      httpStatus: number,
      { title, detail, correlationId, errors }: ApiError<T | CommonErrorCodes>,
    ): Problem => ({
      type: "about:blank",
      title,
      status: httpStatus,
      detail,
      correlationId,
      errors: errors.map(({ code, detail }) => ({
        code: allErrors[code],
        detail,
      })),
    });

    return match<unknown, Problem>(error)
      .with(P.instanceOf(ApiError<T | CommonErrorCodes>), (error) => {
        const problem = makeProblem(httpMapper(error), error);
        logger.warn(makeProblemLogString(problem, error));
        return problem;
      })
      .otherwise((error: unknown) => {
        const problem = makeProblem(500, genericError("Unexpected error"));
        logger.error(makeProblemLogString(problem, error));
        return problem;
      });
  };
}

const errorCodes = {
  genericError: "GENERIC_ERROR",
  badRequestError: "BAD_REQUEST_ERROR",
  kafkaMessageProcessError: "KAFKA_MESSAGE_PROCESS_ERROR",
  kafkaMessageMissingData: "KAFKA_MESSAGE_MISSING_DATA",
  kafkaMessageValueError: "KAFKA_MESSAGE_VALUE_ERROR",
} as const;

export type CommonErrorCodes = keyof typeof errorCodes;

export function genericError(details: string): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: details,
    code: "genericError",
    title: "Unexpected error",
  });
}

export function badRequestError(
  detail: string,
  errors?: Error[],
): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail,
    code: "badRequestError",
    title: "Bad request",
    errors,
  });
}

/* ===== Internal Error ===== */

export function genericInternalError(
  details: string,
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "genericError",
    detail: details,
  });
}

export function kafkaMessageProcessError(
  topic: string,
  partition: number,
  offset: string,
  error?: unknown,
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "kafkaMessageProcessError",
    detail: `Error while handling kafka message from topic : ${topic} - partition ${partition} - offset ${offset}. ${error}`,
  });
}

export function kafkaMessageMissingData(
  topic: string,
  eventType: string,
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "kafkaMessageMissingData",
    detail: `Missing data in kafka message from topic: ${topic} and event type: ${eventType}`,
  });
}

export function kafkaMissingMessageValue(
  topic: string,
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "kafkaMessageValueError",
    detail: `Missing value message in kafka message from topic: ${topic}`,
  });
}
