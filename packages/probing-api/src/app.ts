import { zodiosCtx } from "pagopa-interop-probing-commons";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import eServiceRouter from "./routers/eserviceRouter.js";
import { config } from "./utilities/config.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);

const app = zodiosCtx.app();

// Disable the "X-Powered-By: Express" HTTP header for security reasons.
// See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

app.use(eServiceRouter(zodiosCtx)(operationsApiClient));

export default app;
