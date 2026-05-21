import {
  contextMiddleware,
  loggerMiddleware,
  queryParamsMiddleware,
  zodiosCtx,
} from "pagopa-interop-probing-commons";
import eServiceRouter from "./routers/eserviceRouter.js";
import tenantRouter from "./routers/tenantRouter.js";
import { config } from "./utilities/config.js";
import { EserviceService } from "./services/eserviceService.js";
import { TenantService } from "./services/tenantService.js";

export function createApp(
  eServiceService: EserviceService,
  tenantService: TenantService,
) {
  const app = zodiosCtx.app();

  // Disable the "X-Powered-By: Express" HTTP header for security reasons.
  // See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
  app.disable("x-powered-by");
  app.use(queryParamsMiddleware);
  app.use(contextMiddleware(config.applicationName));
  app.use(loggerMiddleware(config.applicationName));
  app.use(eServiceRouter(zodiosCtx, eServiceService));
  app.use(tenantRouter(zodiosCtx, tenantService));

  return app;
}
