import { z } from "zod";
import { APIEndpoint } from "../model/apiEndpoint.js";

export const HTTPServerConfig = z
  .object({
    HOST: APIEndpoint,
    PORT: z.coerce.number().min(1001),
    KEEP_ALIVE_TIMEOUT_MILLIS: z.coerce.number().default(5000),
  })
  .transform((c) => ({
    host: c.HOST,
    port: c.PORT,
    keepAliveTimeout: c.KEEP_ALIVE_TIMEOUT_MILLIS,
  }));
export type HTTPServerConfig = z.infer<typeof HTTPServerConfig>;

export const httpServerConfig: () => HTTPServerConfig = () =>
  HTTPServerConfig.parse(process.env);
