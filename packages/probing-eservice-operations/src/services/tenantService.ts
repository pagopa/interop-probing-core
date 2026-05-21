import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import { DBService } from "./dbService.js";
import { tenantNotFound } from "../model/domain/errors.js";

export function tenantServiceBuilder(dbService: DBService) {
  return {
    async saveTenant(
      params: probingEserviceOperationsApi.ApiSaveTenantParams,
      data: probingEserviceOperationsApi.ApiSaveTenantPayload,
    ): Promise<probingEserviceOperationsApi.ApiSaveTenantResponse> {
      return await dbService.saveTenant({
        tenant_id: params.tenantId,
        tenant_name: data.name,
      });
    },

    async deleteTenant(
      tenantId: string,
    ): Promise<probingEserviceOperationsApi.ApiDeleteTenantResponse> {
      const tenant = await dbService.getTenantById(tenantId);

      if (!tenant) {
        throw tenantNotFound(tenantId);
      }

      return await dbService.deleteTenant(tenantId);
    },
  };
}

export type TenantService = ReturnType<typeof tenantServiceBuilder>;
