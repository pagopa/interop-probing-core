/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";
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
    super({ code, title, detail, status });
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
      status,
    }: ApplicationError<ErrorCodes>): AppError =>
      new AppError({
        code: allErrors[code],
        title,
        detail,
        status,
      });

    return match<unknown, AppError>(error)
      .with(P.instanceOf(AppError), (applicationError) => applicationError)
      .with(P.instanceOf(ApplicationError<ErrorCodes>), (applicationError) =>
        makeApplicationError(applicationError),
      )
      .otherwise((e) =>
        makeApplicationError(
          genericError(e instanceof Error ? `${e.message}` : `${e}`),
        ),
      );
  };
}

export const errorCodes = {
  genericError: "9999",
  readObjectS3BucketError: "0001",
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

export function readObjectS3BucketError(
  detail: unknown,
): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "readObjectS3BucketError",
    title: "Read Object from S3 Bucket error",
  });
}
