import { ZodiosEndpointDefinitions } from "@zodios/core";
import {
  ZodiosRouterContextRequestHandler,
  zodiosContext,
} from "@zodios/express";
import { match, P } from "ts-pattern";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Logger, logger } from "../logging/index.js";
import { probingCorrelationIdToHeader } from "./headers.js";

export const AppContext = z.object({
  serviceName: z.string(),
  correlationId: z.string(),
});
export type AppContext = z.infer<typeof AppContext>;

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const withJsonDecodedParams = <Api extends ZodiosEndpointDefinitions>(
  api: Api,
): Api =>
  api.map((endpoint) => ({
    ...endpoint,
    parameters: endpoint.parameters?.map((param) =>
      match(param)
        .with({ type: P.union("Path", "Query") }, ({ schema }) => ({
          ...param,
          schema: z.preprocess(
            (value) =>
              match(value)
                .with(P.string, (raw) =>
                  schema.safeParse(raw).success ? raw : parseJson(raw),
                )
                .otherwise(() => value),
            schema,
          ),
        }))
        .otherwise(() => param),
    ),
  })) as Api;

export const zodiosCtx = zodiosContext(z.object({ ctx: AppContext }));

// @zodios/express 10 relies on Zod 3 internals: with Zod 4 its default
// validation (transform: false) throws, and it no longer JSON-decodes path and
// query params (e.g. "10" -> 10). Validate with transform enabled and decode here.
const createZodiosRouter = zodiosCtx.router.bind(zodiosCtx);
zodiosCtx.router = (api, options) =>
  createZodiosRouter(withJsonDecodedParams(api), {
    ...options,
    transform: true,
  });

export type ZodiosContext = NonNullable<typeof zodiosCtx>;
export type ExpressContext = NonNullable<typeof zodiosCtx.context>;

export type WithLogger<T> = T & { logger: Logger };
export type WithSQSMessageId<T> = T & { messageId?: string };

export function fromAppContext(ctx: AppContext): WithLogger<AppContext> {
  return { ...ctx, logger: logger({ ...ctx }) };
}

export const contextMiddleware =
  (serviceName: string): ZodiosRouterContextRequestHandler<ExpressContext> =>
  (req, _res, next): void => {
    req.ctx = {
      serviceName,
      correlationId: probingCorrelationIdToHeader(req) ?? uuidv4(),
    } as AppContext;

    next();
  };
