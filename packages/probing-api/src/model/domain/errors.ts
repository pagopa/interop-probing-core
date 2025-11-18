import {
  ApiError,
  generateId,
  makeApiProblemBuilder,
  Problem,
} from "pagopa-interop-probing-models";
import { AxiosError } from "axios";
import {
  AppContext,
  genericLogger,
  logger,
} from "pagopa-interop-probing-commons";
import { errorMapper } from "../../utilities/errorMapper.js";

export const errorCodes = {
  eServiceNotFound: "ESERVICE_NOT_FOUND",
  eServiceByRecordIdNotFound: "ESERVICE_BY_RECORD_ID_NOT_FOUND",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export const resolveApiProblem = (error: unknown, ctx: AppContext): Problem => {
  try {
    const axiosApiProblem = Problem.safeParse(
      (error as AxiosError).response?.data,
    );

    if (axiosApiProblem.success) {
      return axiosApiProblem.data;
    } else {
      return makeApiProblem(error, errorMapper, logger(ctx), ctx.correlationId);
    }
  } catch (error) {
    genericLogger.info(`Error on resolveApiProblem: - ${error}`);
    return makeApiProblem(error, errorMapper, logger({ ...ctx }), generateId());
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
