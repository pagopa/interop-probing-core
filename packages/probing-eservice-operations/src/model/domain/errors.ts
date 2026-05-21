import { ApiError, makeApiProblemBuilder } from "pagopa-interop-probing-models";

export const errorCodes = {
  eServiceNotFound: "ESERVICE_NOT_FOUND",
  eServiceByRecordIdNotFound: "ESERVICE_BY_RECORD_ID_NOT_FOUND",
  eServiceByVersionIdNotFound: "ESERVICE_BY_VERSION_ID_NOT_FOUND",
  tenantNotFound: "TENANT_NOT_FOUND",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function eServiceNotFound(eserviceId: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService with eserviceId ${eserviceId} not found`,
    code: "eServiceNotFound",
    title: "EService not found",
  });
}

export function eServiceByRecordIdNotFound(
  eserviceRecordId: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService with eserviceRecordId ${eserviceRecordId} not found`,
    code: "eServiceByRecordIdNotFound",
    title: "EService not found",
  });
}

export function eServiceByVersionIdNotFound(
  eserviceId: string,
  versionId: string,
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `EService with eserviceId ${eserviceId} and versionId ${versionId} not found`,
    code: "eServiceByVersionIdNotFound",
    title: "EService not found",
  });
}

export function tenantNotFound(tenantId: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Tenant with tenantId ${tenantId} not found`,
    code: "tenantNotFound",
    title: "Tenant not found",
  });
}
