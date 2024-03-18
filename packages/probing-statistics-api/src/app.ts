import { zodiosCtx } from "pagopa-interop-probing-commons";
import statisticsRouter from "./routers/statisticsRouter.js";
import { TimestreamService, timestreamServiceBuilder } from "./services/timestreamService.js";
import { StatisticsService, statisticsServiceBuilder } from "./services/statisticsService.js";
import { TimestreamQueryClientHandler, timestreamQueryClientBuilder } from "./utilities/timestreamQueryClientHandler.js";

const timestreamQueryClient: TimestreamQueryClientHandler = timestreamQueryClientBuilder()
const timestreamService: TimestreamService = timestreamServiceBuilder(timestreamQueryClient);
const statisticsService: StatisticsService = statisticsServiceBuilder(timestreamService);

const app = zodiosCtx.app();

// Disable the "X-Powered-By: Express" HTTP header for security reasons.
// See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

app.use(statisticsRouter(zodiosCtx)(statisticsService));

export default app;
