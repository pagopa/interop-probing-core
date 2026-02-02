import { ZodiosInstance } from "@zodios/core";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import { errorDeleteTenant, errorSaveTenant } from "../models/domain/errors.js";
import { Logger } from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<probingEserviceOperationsApi.TenantApi>,
) => {
  return {
    async saveTenant(
      headers: probingEserviceOperationsApi.ApiSaveTenantHeaders,
      params: probingEserviceOperationsApi.ApiSaveTenantParams,
      data: probingEserviceOperationsApi.ApiSaveTenantPayload,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiSaveTenantResponse> {
      try {
        logger.info(`Saving tenant with tenantId: ${params.tenantId}.`);

        await operationsApiClient.saveTenant(
          {
            name: data.name,
          },
          {
            headers,
            params,
          },
        );
      } catch (error: unknown) {
        throw errorSaveTenant(params.tenantId, error);
      }
    },
    async deleteTenant(
      headers: probingEserviceOperationsApi.ApiDeleteTenantHeaders,
      params: probingEserviceOperationsApi.ApiDeleteTenantParams,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiDeleteTenantResponse> {
      try {
        logger.info(`Deleting tenant with tenantId: ${params.tenantId}.`);

        await operationsApiClient.deleteTenant(undefined, {
          headers,
          params,
        });
      } catch (error: unknown) {
        throw errorDeleteTenant(params.tenantId, error);
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
