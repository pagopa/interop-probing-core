/* eslint-disable sonarjs/no-identical-functions */
import { constants } from "http2";
import { ApiError, CommonErrorCodes } from "pagopa-interop-probing-models";
import { match } from "ts-pattern";
import { ErrorCodes as LocalErrorCodes } from "../model/domain/errors.js";

type ErrorCodes = LocalErrorCodes | CommonErrorCodes;

const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_BAD_REQUEST
} = constants;

export const updateEServiceErrorMapper = (
  error: ApiError<ErrorCodes>
): number =>
  match(error.code)
    .with("eServiceCannotBeUpdated", () => HTTP_STATUS_BAD_REQUEST)
    .with("eServiceNotFound", () => HTTP_STATUS_BAD_REQUEST)
    .otherwise(() => HTTP_STATUS_INTERNAL_SERVER_ERROR);