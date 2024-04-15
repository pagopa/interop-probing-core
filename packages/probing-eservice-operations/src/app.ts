import { zodiosCtx } from "pagopa-interop-probing-commons";
import eServiceRouter from "./routers/eserviceRouter.js";

const app = zodiosCtx.app();

// Disable the "X-Powered-By: Express" HTTP header for security reasons.
// See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

app.use(eServiceRouter(zodiosCtx));

export default app;
console.log("ok")
