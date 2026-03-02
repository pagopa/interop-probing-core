import helmet from "helmet";
import express from "express";
import cors, { CorsOptions } from "cors";
import {
  contextMiddleware,
  errorsToApiProblemsMiddleware,
  healthRouter,
  loggerMiddleware,
  queryParamsMiddleware,
  zodiosCtx,
} from "pagopa-interop-probing-commons";
import eServiceRouter from "./routers/eserviceRouter.js";
import { config } from "./utilities/config.js";
import { OperationsService } from "./services/operationsService.js";
import { probingApi } from "pagopa-interop-probing-api-clients";

export function createApp(operationsService: OperationsService) {
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
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
  };
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(queryParamsMiddleware);
  app.use(contextMiddleware(config.applicationName));
  app.use(healthRouter(probingApi.HealthApi.api));
  app.use(loggerMiddleware(config.applicationName));
  app.use(eServiceRouter(zodiosCtx, operationsService));

  app.use(errorsToApiProblemsMiddleware);

  return app;
}
