/* eslint-disable max-classes-per-file */
import { Logger } from "pagopa-interop-probing-commons";
import {
  AppError,
  ApplicationError,
  makeAppErrorLogString,
} from "pagopa-interop-probing-models";
import { P, match } from "ts-pattern";

export function makeApplicationErrorBuilder<T extends string>(errors: {
  [K in T]: string;
}): (error: unknown, logger: Logger) => AppError {
  const allErrors = { ...errorCodes, ...errors };

  return (error: unknown, logger: Logger) => {
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
      .with(P.instanceOf(ApplicationError<ErrorCodes>), (applicationError) => {
        const appError = makeApplicationError(applicationError);
        logger.warn(makeAppErrorLogString(appError, error));
        return appError;
      })
      .otherwise((e) => {
        const appError = makeApplicationError(
          genericError(e instanceof Error ? `${e.message}` : `${e}`),
        );
        logger.warn(makeAppErrorLogString(appError, error));
        return appError;
      });
  };
}

export const errorCodes = {
  genericError: "9999",
  decodeSQSMessageError: "0001",
  writeRecordTimestreamError: "0002",
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

export function writeRecordTimestreamError(
  detail: string,
): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "writeRecordTimestreamError",
    title: `Timestream record write failed`,
  });
}

export function decodeSQSMessageError(
  detail: string,
): ApplicationError<ErrorCodes> {
  return new ApplicationError({
    detail: `${detail}`,
    code: "decodeSQSMessageError",
    title: "Decode SQS Message error",
  });
}
