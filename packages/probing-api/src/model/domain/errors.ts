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
  eServiceNotFound: "0001",
  eServiceMainDataByRecordIdNotFound: "0002",
  eServiceProbingDataByRecordIdNotFound: "0003",
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

export function eServiceNotFound(
  eserviceId: string,
  versionId: string,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService by ${eserviceId} version ${versionId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}

export function eServiceMainDataByRecordIdNotFound(
  eserviceRecordId: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService main data by eserviceRecordId ${eserviceRecordId} not found`,
    code: "eServiceMainDataByRecordIdNotFound",
    title: "EService not found",
  });
}

export function eServiceProbingDataByRecordIdNotFound(
  eserviceRecordId: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService probing data by eserviceRecordId ${eserviceRecordId} not found`,
    code: "eServiceProbingDataByRecordIdNotFound",
    title: "EService not found",
  });
}
