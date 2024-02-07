/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";
import { ZodError } from "zod";

export class ApplicationError<T> extends Error {
  public code: T;
  public title: string;
  public detail: string;

  constructor({
    code,
    title,
    detail,
  }: {
    code: T;
    title: string;
    detail: string;
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
  }
}

export class AppError extends ApplicationError<string> {
  constructor({
    code,
    title,
    detail,
  }: {
    code: string;
    title: string;
    detail: string;
  }) {
    super({ code, title, detail });
  }
}

export function makeApplicationErrorBuilder<T extends string>(errors: {
  [K in T]: string;
}): (error: unknown) => AppError {
  const allErrors = { ...errorCodes, ...errors };

  return (error: unknown) => {
    const makeApplicationError = ({
      code,
      title,
      detail,
    }: ApplicationError<ErrorCodes>): AppError =>
      new AppError({
        code: allErrors[code],
        title,
        detail,
      });

    return match<unknown, AppError>(error)
      .with(P.instanceOf(ApplicationError<ErrorCodes>), (applicationError) =>
        makeApplicationError(applicationError)
      )
      .otherwise((e) =>
        makeApplicationError(
          genericError(e instanceof Error ? `${e.message}` : `${e}`)
        )
      );
  };
}

export const errorCodes = {
  genericError: "9999",
  apiUpdateResponseReceivedError: "0001",
  decodeSQSMessageError: "0002",
} as const;

export type ErrorCodes = keyof typeof errorCodes;

export const makeApplicationError = makeApplicationErrorBuilder(errorCodes);

export function genericError(detail: string): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "genericError",
    title: "Unexpected error",
  });
}

export function apiUpdateResponseReceivedError(
  detail: string,
  error: unknown
): ApplicationError<ErrorCodes> {
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new ApplicationError({
    detail: `${detail} ${zodiosErrorDetails}`,
    code: "apiUpdateResponseReceivedError",
    title: "EService service updateResponseReceived error",
  });
}

export function decodeSQSMessageError(
  detail: string
): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "decodeSQSMessageError",
    title: "Decode SQS Message error",
  });
}
