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

        logger.info(`Tenant saved with tenantId: ${data.tenantId}.`);
      } catch (error: unknown) {
        throw errorSaveTenant(
          `Error saving tenant with tenantId: ${
            params.tenantId
          }. Details: ${error}. Data: ${JSON.stringify(data)}`,
        );
      }
    },
    async deleteTenant(
      headers: ApiDeleteTenantHeaders,
      params: ApiDeleteTenantParams,
      logger: Logger,
    ): Promise<ApiDeleteTenantResponse> {
      try {
        await operationsApiClient.deleteTenant(undefined, {
          headers,
          params,
        });

        logger.info(`Tenant deleted with tenantId: ${params.tenantId}.`);
      } catch (error: unknown) {
        throw errorDeleteTenant(
          `Error deleting tenant with tenantId: ${params.tenantId}. Details: ${error}`,
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
