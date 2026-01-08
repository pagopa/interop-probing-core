import { constants } from "http2";
import express, { Response, NextFunction } from "express";
import {
  badRequestError,
  genericError,
  makeApiProblemBuilder,
  parseErrorMessage,
} from "pagopa-interop-probing-models";
import { WithZodiosContext } from "@zodios/express";
import { ExpressContext, fromAppContext } from "../context/context.js";
import { logger } from "../logging/logger.js";

const makeApiProblem = makeApiProblemBuilder({});

export function errorsToApiProblemsMiddleware(
  error: unknown,
  req: WithZodiosContext<express.Request, ExpressContext>,
  res: Response,
  next: NextFunction,
): Response | void {
  if (res.headersSent) {
    return next(error);
  }

  const ctx = fromAppContext(req.ctx);
  ctx.logger.error(`Error in request: ${parseErrorMessage(error)}`);

  if (error instanceof SyntaxError) {
    return res
      .status(constants.HTTP_STATUS_BAD_REQUEST)
      .send(
        makeApiProblem(
          badRequestError("Invalid request body"),
          () => constants.HTTP_STATUS_BAD_REQUEST,
          logger(ctx),
          ctx.correlationId,
        ),
      );
  }

  return res
    .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    .send(
      makeApiProblem(
        genericError("Unexpected error"),
        () => constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        logger(ctx),
        ctx.correlationId,
      ),
    );
}
