import {
  contextMiddleware,
  errorsToApiProblemsMiddleware,
  healthRouter,
  loggerMiddleware,
  zodiosCtx,
} from "pagopa-interop-probing-commons";
import statisticsRouter from "./routers/statisticsRouter.js";
import { StatisticsService } from "./services/statisticsService.js";
import { config } from "./utilities/config.js";
import helmet from "helmet";
import express from "express";
import cors, { CorsOptions } from "cors";
import { probingStatisticsApi } from "pagopa-interop-probing-api-clients";

export function createApp(statisticsService: StatisticsService) {
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
    }),
  );

  app.use(
    helmet.hsts({
      includeSubDomains: true,
      maxAge: 10886400,
    }),
  );

  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(helmet.frameguard({ action: "deny" }));

  const corsOptions: CorsOptions = {
    origin: config.corsOriginAllowed,
    methods: ["POST", "PUT", "GET", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(contextMiddleware(config.applicationName));
  app.use(healthRouter(probingStatisticsApi.HealthApi.api));
  app.use(loggerMiddleware(config.applicationName));

  app.use(statisticsRouter(zodiosCtx, statisticsService));

  app.use(errorsToApiProblemsMiddleware);

  return app;
}
