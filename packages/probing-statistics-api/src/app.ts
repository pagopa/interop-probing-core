import { zodiosCtx } from "pagopa-interop-probing-commons";
import statisticsRouter from "./routers/statisticsRouter.js";
import healthRouter from "./routers/healthRouter.js";
import {
  TimestreamService,
  timestreamServiceBuilder,
} from "./services/timestreamService.js";
import {
  StatisticsService,
  statisticsServiceBuilder,
} from "./services/statisticsService.js";
import {
  TimestreamQueryClientHandler,
  timestreamQueryClientBuilder,
} from "./utilities/timestreamQueryClientHandler.js";
import { config } from "./utilities/config.js";
import helmet from "helmet";
import express from "express";
import cors, { CorsOptions } from "cors";

const timestreamQueryClient: TimestreamQueryClientHandler =
  timestreamQueryClientBuilder();
const timestreamService: TimestreamService = timestreamServiceBuilder(
  timestreamQueryClient
);
const statisticsService: StatisticsService =
  statisticsServiceBuilder(timestreamService);

const app = zodiosCtx.app();

// Disable the "X-Powered-By: Express" HTTP header for security reasons.
// See https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'"],
      styleSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  })
);

app.use(cors());

app.use(
  helmet.hsts({
    includeSubDomains: true,
    maxAge: 10886400,
  })
);

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: "deny" }));

const corsOptions: CorsOptions = {
  origin: config.corsOriginAllowed,
  methods: ["POST", "PUT", "GET", "OPTIONS", "DELETE"],
  allowedHeaders: "*",
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(healthRouter);
app.use(statisticsRouter(zodiosCtx)(statisticsService));

export default app;
