import {
  HTTPServerConfig,
  LoggerConfig,
  AWSConfig,
} from "pagopa-interop-probing-commons";
import { z } from "zod";

const statisticsApiConfig = HTTPServerConfig.and(LoggerConfig)
  .and(AWSConfig)
  .and(
    z
      .object({
        INTEROP_PROBING_STATISTICS_APP_NAME: z.string(),
        TIMESTREAM_DATABASE: z.string(),
        TIMESTREAM_TABLE: z.string(),
        GRAPH_PERFORMANCE_PRECISION: z.coerce.number().min(1),
        GRAPH_PERFORMANCE_TOLERANCE: z.coerce.number().min(1),
        GRAPH_FAILURE_PRECISION: z.coerce.number().min(1),
        GRAPH_FAILURE_TOLERANCE: z.coerce.number().min(1),
        GRAPH_MAX_MONTHS: z.coerce.number().min(1),
        CORS_ORIGIN_ALLOWED: z.string(),
      })
      .transform((c) => ({
        interopProbingStatisticsAppName: c.INTEROP_PROBING_STATISTICS_APP_NAME,
        timestreamDatabase: c.TIMESTREAM_DATABASE,
        timestreamTable: c.TIMESTREAM_TABLE,
        graphPerformancePrecision: c.GRAPH_PERFORMANCE_PRECISION,
        graphPerformanceTolerance: c.GRAPH_PERFORMANCE_TOLERANCE,
        graphFailurePrecision: c.GRAPH_FAILURE_PRECISION,
        graphFailureTolerance: c.GRAPH_FAILURE_TOLERANCE,
        graphMaxMonths: c.GRAPH_MAX_MONTHS,
        corsOriginAllowed: c.CORS_ORIGIN_ALLOWED,
      }))
  );

export type StatisticsApiConfig = z.infer<typeof statisticsApiConfig>;

export const config: StatisticsApiConfig = statisticsApiConfig.parse(process.env);
