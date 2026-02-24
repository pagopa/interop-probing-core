import winston from "winston";
import { LoggerConfig } from "../config/loggerConfig.js";

export type LoggerMetadata = {
  serviceName?: string;
  correlationId?: string | null;
  messageId?: string | null;
  eventType?: string;
  eventVersion?: number;
  streamId?: string;
  version?: number;
  eserviceId?: string;
  purposeId?: string;
};

const parsedLoggerConfig = LoggerConfig.safeParse(process.env);
const config: LoggerConfig = parsedLoggerConfig.success
  ? parsedLoggerConfig.data
  : {
      logLevel: "info",
    };

if (!parsedLoggerConfig.success) {
  // eslint-disable-next-line no-console
  console.log(
    `No LOG_LEVEL env var: defaulting log level to "${config.logLevel}"`,
  );
}

const logFormat = (
  msg: string,
  timestamp: unknown,
  level: string,
  { serviceName, correlationId, messageId }: LoggerMetadata,
) => {
  const serviceLogPart = serviceName ? `[${serviceName}]` : undefined;
  const correlationLogPart = correlationId
    ? `[CID=${correlationId}]`
    : undefined;

  const sqsMessageIdLogPart = messageId ? `[SQS MID=${messageId}]` : undefined;

  const firstPart = [timestamp, level.toUpperCase(), serviceLogPart]
    .filter((e) => e !== undefined)
    .join(" ");

  const secondPart = [correlationLogPart, sqsMessageIdLogPart]
    .filter((e) => e !== undefined)
    .join(" ");

  return `${firstPart} - ${secondPart} ${msg}`.replace(/\s+/g, " ");
};

export const customFormat = () =>
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    if (!meta.loggerMetadata) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] loggerMetadata not found for message: ${message}`);
    }
    const lines = `${message}`
      .toString()
      .split("\n")
      .map((line: string) =>
        logFormat(line, timestamp, level, meta.loggerMetadata || {}),
      );
    return lines.join("\n");
  });

const getLogger = () =>
  winston.createLogger({
    level: config.logLevel,
    transports: [
      new winston.transports.Console({
        stderrLevels: ["error"],
      }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.errors({ stack: true }),
      customFormat(),
    ),
    silent: process.env.NODE_ENV === "test",
  });

const internalLoggerInstance = getLogger();

const elapsedTime = (startTime: number): string =>
  `[${Date.now() - startTime}ms]`;

export const logger = (loggerMetadata: LoggerMetadata) => {
  const appendElapsedTime = (msg: string, startTime?: number): string => {
    if (startTime !== undefined && internalLoggerInstance.isDebugEnabled()) {
      return `${elapsedTime(startTime)} ${msg}`;
    }
    return msg;
  };

  return {
    isDebugEnabled: () => internalLoggerInstance.isDebugEnabled(),
    debug: (
      msg: (typeof internalLoggerInstance.debug.arguments)[0],
      startTime?: number,
    ) =>
      internalLoggerInstance.debug(
        appendElapsedTime(`${msg}`, startTime),
        {
          loggerMetadata,
        },
      ),
    info: (
      msg: (typeof internalLoggerInstance.info.arguments)[0],
      startTime?: number,
    ) =>
      internalLoggerInstance.info(
        appendElapsedTime(`${msg}`, startTime),
        {
          loggerMetadata,
        },
      ),
    warn: (
      msg: (typeof internalLoggerInstance.warn.arguments)[0],
      startTime?: number,
    ) =>
      internalLoggerInstance.warn(
        appendElapsedTime(`${msg}`, startTime),
        {
          loggerMetadata,
        },
      ),
    error: (
      msg: (typeof internalLoggerInstance.error.arguments)[0],
      startTime?: number,
    ) =>
      internalLoggerInstance.error(
        appendElapsedTime(`${msg}`, startTime),
        {
          loggerMetadata,
        },
      ),
  };
};

export type Logger = ReturnType<typeof logger>;

export const genericLogger = logger({});
