import helmet from "helmet";
import express from "express";
import cors, { CorsOptions } from "cors";
import {
  contextMiddleware,
  loggerMiddleware,
  zodiosCtx,
} from "pagopa-interop-probing-commons";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import eServiceRouter from "./routers/eserviceRouter.js";
import healthRouter from "./routers/healthRouter.js";
import { config } from "./utilities/config.js";
import { queryParamsMiddleware } from "./middlewares/query.js";

const operationsApiClient = createApiClient(config.operationsBaseUrl);

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

app.use(cors());

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
  allowedHeaders: "*",
};

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(queryParamsMiddleware);
app.use(contextMiddleware(config.applicationName));
app.use(loggerMiddleware(config.applicationName));
app.use(healthRouter);
app.use(eServiceRouter(zodiosCtx)(operationsApiClient));

export default app;
