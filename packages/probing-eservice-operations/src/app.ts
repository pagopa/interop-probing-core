import {
  contextMiddleware,
  loggerMiddleware,
  zodiosCtx,
  queryParamsMiddleware,
} from "pagopa-interop-probing-commons";
import eServiceRouter from "./routers/eserviceRouter.js";
import tenantRouter from "./routers/tenantRouter.js";
import { config } from "./utilities/config.js";
import { eServiceServiceBuilder } from "./services/eserviceService.js";
import { tenantServiceBuilder } from "./services/tenantService.js";
import { makeDrizzleConnection } from "./db/utils.js";
import { dbServiceBuilder } from "./services/dbService.js";

const app = zodiosCtx.app();

// Disable the "X-Powered-By: Express" HTTP header for security reasons.
// See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

const db = makeDrizzleConnection(config);

const dbRepository = dbServiceBuilder(db);
const eServiceService = eServiceServiceBuilder(dbRepository);
const tenantService = tenantServiceBuilder(dbRepository);

app.use(queryParamsMiddleware);
app.use(contextMiddleware(config.applicationName));
app.use(loggerMiddleware(config.applicationName));
app.use(eServiceRouter(zodiosCtx, eServiceService));
app.use(tenantRouter(zodiosCtx, tenantService));

export default app;
