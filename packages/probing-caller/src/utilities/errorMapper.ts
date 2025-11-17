import { AxiosError } from "axios";
import { callerConstants } from "../utilities/constants.js";
import { match, P } from "ts-pattern";
import {
  CommonErrorCodes,
  genericInternalError,
  InternalError,
} from "pagopa-interop-probing-models";
import { Logger } from "pagopa-interop-probing-commons";
import { ErrorCodes } from "../model/domain/errors.js";

type LocalErrorCodes = ErrorCodes | CommonErrorCodes;

export const errorMapper = (error: unknown, logger: Logger) =>
  match<unknown, InternalError<LocalErrorCodes>>(error)
    .with(P.instanceOf(InternalError<LocalErrorCodes>), (error) => {
      logger.error(error);
      throw error;
    })
    .otherwise((error: unknown) => {
      logger.error(error);
      throw genericInternalError(`${error}`);
    });

export function getKoReason(error: unknown): string {
  return match((error as AxiosError).code)
    .with("ECONNREFUSED", () => callerConstants.CONNECTION_REFUSED_KO_REASON)
    .with("ETIMEDOUT", () => callerConstants.CONNECTION_TIMEOUT_KO_REASON)
    .otherwise(() => {
      const status = (error as AxiosError).response?.status;
      return status ? `${status}` : callerConstants.UNKNOWN_KO_REASON;
    });
}
