import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

export const ProblemError = z.object({
  code: z
    .string()
    .min(8)
    .max(8)
    .regex(/^[0-9]{3}-[0-9]{4}$/),
  detail: z
    .string()
    .max(4096)
    .regex(/^.{0,1024}$/),
});
export type ProblemError = z.infer<typeof ProblemError>;

export const Problem = z.object({
  type: z.string(),
  status: z.number().int().gte(100).lte(600),
  title: z
    .string()
    .max(64)
    .regex(/^[ -~]{0,64}$/),
  detail: z
    .string()
    .max(4096)
    .regex(/^.{0,1024}$/)
    .optional(),
  correlationId: z.string().optional(),
  errors: z.array(ProblemError).optional(),
});
export type Problem = z.infer<typeof Problem>;

export const PerformanceContent = z.object({
  responseTime: z.number().int(),
  time: z.string().datetime({ offset: true }),
});
export type PerformanceContent = z.infer<typeof PerformanceContent>;

export const FailureContent = z.object({
  status: z.enum(["KO", "N_D"]),
  time: z.string().datetime({ offset: true }),
});
export type FailureContent = z.infer<typeof FailureContent>;

export const EserviceStatus = z.enum(["OK", "N_D", "KO"]);
export type EserviceStatus = z.infer<typeof EserviceStatus>;

export const PercentageContent = z.object({
  value: z.number(),
  status: EserviceStatus,
});
export type PercentageContent = z.infer<typeof PercentageContent>;

export const TelemetryDataEserviceResponse = z.object({
  performances: z.array(PerformanceContent),
  failures: z.array(FailureContent),
  percentages: z.array(PercentageContent),
});
export type TelemetryDataEserviceResponse = z.infer<
  typeof TelemetryDataEserviceResponse
>;

export const HealthEndpoints = makeApi([
  {
    method: "get",
    path: "/status",
    alias: "getStatus",
    description: `Returns the application status`,
    requestFormat: "json",
    response: z.object({
      type: z.string(),
      status: z.number().int().gte(100).lte(600),
      title: z
        .string()
        .max(64)
        .regex(/^[ -~]{0,64}$/),
      detail: z
        .string()
        .max(4096)
        .regex(/^.{0,1024}$/)
        .optional(),
      correlationId: z.string().optional(),
      errors: z.array(ProblemError).optional(),
    }),
  },
]);

export const HealthApi = new Zodios(HealthEndpoints);

export function createHealthApiClient(
  baseUrl: string,
  options?: ZodiosOptions
) {
  const zodiosClient = new Zodios(baseUrl, HealthEndpoints, {
    ...options,
  });

  return zodiosClient;
}

export const TelemetryEndpoints = makeApi([
  {
    method: "get",
    path: "/telemetryData/eservices/:eserviceRecordId",
    alias: "statisticsEservices",
    description: `Retrieve e-service statistics`,
    requestFormat: "json",
    parameters: [
      {
        name: "eserviceRecordId",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "pollingFrequency",
        type: "Query",
        schema: z.number().int().gte(1),
      },
    ],
    response: TelemetryDataEserviceResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: z.object({
          type: z.string(),
          status: z.number().int().gte(100).lte(600),
          title: z
            .string()
            .max(64)
            .regex(/^[ -~]{0,64}$/),
          detail: z
            .string()
            .max(4096)
            .regex(/^.{0,1024}$/)
            .optional(),
          correlationId: z.string().optional(),
          errors: z.array(ProblemError).optional(),
        }),
      },
      {
        status: 500,
        description: `A managed error has occured during the request elaboration`,
        schema: z.object({
          type: z.string(),
          status: z.number().int().gte(100).lte(600),
          title: z
            .string()
            .max(64)
            .regex(/^[ -~]{0,64}$/),
          detail: z
            .string()
            .max(4096)
            .regex(/^.{0,1024}$/)
            .optional(),
          correlationId: z.string().optional(),
          errors: z.array(ProblemError).optional(),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/telemetryData/eservices/filtered/:eserviceRecordId",
    alias: "filteredStatisticsEservices",
    description: `Retrieve filtered e-service statistics`,
    requestFormat: "json",
    parameters: [
      {
        name: "eserviceRecordId",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "pollingFrequency",
        type: "Query",
        schema: z.number().int().gte(1),
      },
      {
        name: "startDate",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
      {
        name: "endDate",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
    ],
    response: TelemetryDataEserviceResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: z.object({
          type: z.string(),
          status: z.number().int().gte(100).lte(600),
          title: z
            .string()
            .max(64)
            .regex(/^[ -~]{0,64}$/),
          detail: z
            .string()
            .max(4096)
            .regex(/^.{0,1024}$/)
            .optional(),
          correlationId: z.string().optional(),
          errors: z.array(ProblemError).optional(),
        }),
      },
      {
        status: 500,
        description: `A managed error has occured during the request elaboration`,
        schema: z.object({
          type: z.string(),
          status: z.number().int().gte(100).lte(600),
          title: z
            .string()
            .max(64)
            .regex(/^[ -~]{0,64}$/),
          detail: z
            .string()
            .max(4096)
            .regex(/^.{0,1024}$/)
            .optional(),
          correlationId: z.string().optional(),
          errors: z.array(ProblemError).optional(),
        }),
      },
    ],
  },
]);

export const TelemetryApi = new Zodios(TelemetryEndpoints);

export function createTelemetryApiClient(
  baseUrl: string,
  options?: ZodiosOptions
) {
  const zodiosClient = new Zodios(baseUrl, TelemetryEndpoints, {
    ...options,
  });

  return zodiosClient;
}
