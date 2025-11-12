import {
  ApiError,
  makeApiProblemBuilder,
  makeProblemLogString,
  Problem,
} from "pagopa-interop-probing-models";
import { AxiosError } from "axios";
import { Logger } from "pagopa-interop-probing-commons";
import { errorMapper } from "../../utilities/errorMapper.js";

export const errorCodes = {
  eServiceNotFound: "ESERVICE_NOT_FOUND",
  eServiceByRecordIdNotFound: "ESERVICE_BY_RECORD_ID_NOT_FOUND",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export const resolveApiProblem = (error: unknown, logger: Logger): Problem => {
  const axiosApiProblem = Problem.safeParse(
    (error as AxiosError).response?.data,
  );

  if (axiosApiProblem.success) {
    logger.warn(makeProblemLogString(axiosApiProblem.data, error));
    return axiosApiProblem.data;
  } else {
    return makeApiProblem(error, errorMapper, logger);
  }
};

export function eServiceByVersionIdNotFound(
  eserviceId: string,
  versionId: string,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService by ${eserviceId} version ${versionId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}

export function eServiceByRecordIdNotFound(
  eserviceRecordId: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService by eserviceRecordId ${eserviceRecordId} not found`,
    code: "eServiceByRecordIdNotFound",
    title: "EService not found",
  });
}
