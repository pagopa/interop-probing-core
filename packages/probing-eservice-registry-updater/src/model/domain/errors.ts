/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";
import { ZodError } from "zod";
import { AxiosError } from "axios";
import { Logger } from "pagopa-interop-probing-commons";
import {
  AppError,
  ApplicationError,
  makeAppErrorLogString,
} from "pagopa-interop-probing-models";

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
  genericError: "GENERIC_ERROR",
  apiSaveEserviceError: "API_SAVE_ESERVICE_ERROR",
  decodeSQSMessageError: "DECODE_SQS_MESSAGE_ERROR",
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

export function apiSaveEserviceError(
  detail: string,
  error: unknown,
): ApplicationError<ErrorCodes> {
  const status = (error as AxiosError).response?.status;
  const zodiosErrorCause = (error as ZodError)?.cause;
  const zodiosErrorDetails: string = zodiosErrorCause
    ? `Cause: ${JSON.stringify(zodiosErrorCause)}`
    : "";

  return new ApplicationError({
    ...(status && { status }),
    detail: `${detail} ${zodiosErrorDetails}`,
    code: "apiSaveEserviceError",
    title: "EService Operations service saveEservice error",
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
