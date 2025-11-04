import {
  ApiSaveTenantPayload,
  ApiSaveTenantResponse,
  ApiSaveTenantParams,
  ApiDeleteTenantResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { TenantQuery } from "./db/tenantQuery.js";

export function tenantServiceBuilder(tenantQuery: TenantQuery) {
  return {
    async saveTenant(
      params: ApiSaveTenantParams,
      data: ApiSaveTenantPayload,
    ): Promise<ApiSaveTenantResponse> {
      return await tenantQuery.saveTenant({
        tenant_id: params.tenantId,
        tenant_name: data.name,
      });
    },

    async deleteTenant(tenantId: string): Promise<ApiDeleteTenantResponse> {
      return await tenantQuery.deleteTenant(tenantId);
    },
  };
}

export type TenantService = ReturnType<typeof tenantServiceBuilder>;
