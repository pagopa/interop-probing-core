import { TenantSaveRequest } from "pagopa-interop-probing-models";
import { ModelService } from "./dbService.js";
import {
  ApiDeleteEserviceResponse,
  ApiSaveTenantResponse,
} from "pagopa-interop-probing-eservice-operations-client";

export function tenantQueryBuilder(modelService: ModelService) {
  return {
    saveTenant: async (
      tenantSaveRequest: TenantSaveRequest,
    ): Promise<ApiSaveTenantResponse> =>
      await modelService.saveTenant(tenantSaveRequest),

    deleteTenant: async (
      eserviceId: string,
    ): Promise<ApiDeleteEserviceResponse> =>
      await modelService.deleteTenant(eserviceId),
  };
}

export type TenantQuery = ReturnType<typeof tenantQueryBuilder>;
