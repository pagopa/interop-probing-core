import { match, P } from "ts-pattern";
import { ExpressContext } from "pagopa-interop-probing-commons";
import { Request, Response, NextFunction } from "express";
import { ZodiosRouterContextRequestHandler } from "@zodios/express";

/**
 * Middleware to preprocess the 'state' query parameter.
 * Ensures the 'state' parameter is always handled as an array.
 *
 * The issue arises when a query parameter that Zodios expects to handle as an array
 * contains a single element. In such cases, it is treated as a string, leading to validation errors.
 * To address this, the middleware converts the parameter to an array to ensure correct validation preserving schema integrity.
 *
 * Ensures `state` is always an array of strings, even if provided as:
 * - state=ONLINE
 * - state=ONLINE,OFFLINE
 * - state=ONLINE&state=OFFLINE
 */
export const queryParamsMiddleware: ZodiosRouterContextRequestHandler<
  ExpressContext
> = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const q = req.query;

  q.state = match(q.state)
    .with(undefined, () => undefined)
    .with(P.when(Array.isArray), (arr) =>
      (arr as string[]).map((s) => s.trim()),
    )
    .with(P.string, (str) => str.split(",").map((s) => s.trim()))
    .otherwise((val) => [String(val).trim()]);

  next();
};
