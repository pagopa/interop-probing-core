import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiDeleteTenantResponse,
  ApiDeleteTenantHeaders,
  ApiDeleteTenantParams,
  ApiSaveTenantPayload,
  ApiSaveTenantHeaders,
  ApiSaveTenantResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { errorDeleteTenant, errorSaveTenant } from "../models/domain/errors.js";
import { Logger } from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async saveTenant(
      headers: ApiSaveTenantHeaders,
      params: ApiDeleteTenantParams,
      data: ApiSaveTenantPayload,
      logger: Logger,
    ): Promise<ApiSaveTenantResponse> {
      try {
        logger.info(`Saving tenant with tenantId: ${data.tenantId}.`);

        await operationsApiClient.saveTenant(
          {
            name: data.name,
            externalId: data.externalId,
            origin: data.name,
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
      headers: ApiDeleteTenantHeaders,
      params: ApiDeleteTenantParams,
      logger: Logger,
    ): Promise<ApiDeleteTenantResponse> {
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
