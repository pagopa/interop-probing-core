import { z } from "zod";

export type StatisticColumnNames = "time" | "status" | "response_time";

export const telemetrySuccessStatus = {
  ok: "OK",
} as const;

export const telemetryFailureStatus = {
  ko: "KO",
  n_d: "N_D",
} as const;

export const telemetryStatus = {
  ...telemetrySuccessStatus,
  ...telemetryFailureStatus,
} as const;

export const TelemetrySuccessStatus = z.enum([
  Object.values(telemetrySuccessStatus)[0],
  ...Object.values(telemetrySuccessStatus).slice(1),
]);

export type TelemetrySuccessStatus = z.infer<typeof TelemetrySuccessStatus>;

export const TelemetryFailureStatus = z.enum([
  Object.values(telemetryFailureStatus)[0],
  ...Object.values(telemetryFailureStatus).slice(1),
]);

export type TelemetryFailureStatus = z.infer<typeof TelemetryFailureStatus>;

export const TelemetryStatus = z.union([
  TelemetrySuccessStatus,
  TelemetryFailureStatus,
]);

export type TelemetryStatus = z.infer<typeof TelemetryStatus>;

export const StatisticContent = z.object({
  responseTime: z.number().int().nullable().optional(),
  status: TelemetryStatus.optional(),
  time: z.string(),
});

export type StatisticContent = z.infer<typeof StatisticContent>;

export const PercentageContent = z.object({
  value: z.number(),
  status: z.string(),
});

export type PercentageContent = z.infer<typeof PercentageContent>;

export const PerformanceContent = z.object({
  responseTime: z.number().int(),
  time: z.string(),
});

export type PerformanceContent = z.infer<typeof PerformanceContent>;

export const FailureContent = z.object({
  time: z.string(),
  status: TelemetryFailureStatus,
});

export type FailureContent = z.infer<typeof FailureContent>;
