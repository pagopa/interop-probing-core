import { constants } from "http2";
import { ApiError, CommonErrorCodes } from "pagopa-interop-probing-models";
import { match } from "ts-pattern";

type ErrorCodes = CommonErrorCodes;

const { HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants;

export const errorMapper = (error: ApiError<ErrorCodes>): number =>
  match(error.code).otherwise(() => HTTP_STATUS_INTERNAL_SERVER_ERROR);
