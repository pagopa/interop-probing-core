/* eslint-disable sonarjs/no-identical-functions */
import { constants } from "http2";
import { ApiError, CommonErrorCodes } from "pagopa-interop-probing-models";
import { match } from "ts-pattern";
import { ErrorCodes as LocalErrorCodes } from "../model/domain/errors.js";

type ErrorCodes = LocalErrorCodes | CommonErrorCodes;

const { HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants;

export const statisticsErrorMapper = (
  error: ApiError<ErrorCodes>
): number =>
  match(error.code)
    .with("missingScalarValueTelemetry", () => HTTP_STATUS_INTERNAL_SERVER_ERROR)
    .with("queryTimestreamError", () => HTTP_STATUS_INTERNAL_SERVER_ERROR)
    .otherwise(() => HTTP_STATUS_INTERNAL_SERVER_ERROR);
