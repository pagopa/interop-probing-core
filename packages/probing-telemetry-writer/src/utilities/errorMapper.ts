import { match, P } from "ts-pattern";
import {
  CommonErrorCodes,
  genericInternalError,
  InternalError,
} from "pagopa-interop-probing-models";
import { Logger } from "pagopa-interop-probing-commons";

type LocalErrorCodes = CommonErrorCodes;

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
