import { constants } from "http2";
import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { ZodType } from "zod";
import {
  CorrelationId,
  generateId,
  Problem,
} from "pagopa-interop-probing-models";
import { ExpressContext, zodiosCtx } from "../context/context.js";

type RequiresHealthStatus = [
  {
    method: "get";
    path: "/status";
    response: ZodType<Problem>;
  },
];

export const healthRouter = (
  api: ZodiosEndpointDefinitions & RequiresHealthStatus,
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const router = zodiosCtx.router(api);

  router.get("/status", async (req, res) => {
    const healthProblem: Problem = {
      type: "about:blank",
      correlationId: req.ctx.correlationId || generateId<CorrelationId>(),
      status: constants.HTTP_STATUS_OK,
      title: "Service status OK",
    };

    res.type("application/problem+json").status(200).send(healthProblem);
  });

  return router;
};
