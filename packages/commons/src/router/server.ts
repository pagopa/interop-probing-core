import { Server } from "http";
import { ZodiosApp } from "@zodios/express";
import { ExpressContext } from "../context/context.js";
import { genericLogger } from "../logging/index.js";

/**
 * Starts an HTTP server with the provided Express app and configuration.
 *
 * @param app - The Zodios Express application to serve
 * @param config - Server configuration including host, port, and keep-alive timeout
 * @param config.keepAliveTimeout - Keep-alive timeout in milliseconds
 * @returns The created HTTP server instance
 */
export function startServer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: ZodiosApp<any, ExpressContext>,
  config: {
    host: string;
    port: number;
    keepAliveTimeout: number;
  },
): Server {
  const server = app.listen(config.port, config.host, () => {
    genericLogger.info(`Listening on ${config.host}:${config.port}`);
  });

  server.keepAliveTimeout = config.keepAliveTimeout;

  return server;
}
