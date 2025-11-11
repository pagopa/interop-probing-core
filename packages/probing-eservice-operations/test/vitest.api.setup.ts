import { createApp } from "../src/app.js";
import { EserviceService } from "../src/services/eserviceService.js";
import { TenantService } from "../src/services/tenantService.js";

export const eServiceService = {} as EserviceService;
export const tenantService = {} as TenantService;

export const api = await createApp(eServiceService, tenantService);
