import {
  ApiSaveTenantPayload,
  ApiSaveTenantResponse,
  ApiSaveTenantParams,
  ApiDeleteTenantResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { DBService } from "./dbService.js";
import { tenantNotFound } from "../model/domain/errors.js";

export function tenantServiceBuilder(dbService: DBService) {
  return {
    async saveTenant(
      params: ApiSaveTenantParams,
      data: ApiSaveTenantPayload,
    ): Promise<ApiSaveTenantResponse> {
      return await dbService.saveTenant({
        tenant_id: params.tenantId,
        tenant_name: data.name,
      });
    },

    async deleteTenant(tenantId: string): Promise<ApiDeleteTenantResponse> {
      const tenant = await dbService.getTenantById(tenantId);

      if (!tenant) {
        throw tenantNotFound(tenantId);
      }

      return await dbService.deleteTenant(tenantId);
    },
  };
}

export type TenantService = ReturnType<typeof tenantServiceBuilder>;
