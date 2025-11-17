import { z } from "zod";
import { TelemetryStatus, TelemetryFailureStatus } from "./telemetry.js";

export const PercentageContent = z.object({
  value: z.number(),
  status: TelemetryStatus,
});
export type PercentageContent = z.infer<typeof PercentageContent>;

export const PerformanceContent = z.object({
  time: z.string(),
  responseTime: z.number().int(),
});
export type PerformanceContent = z.infer<typeof PerformanceContent>;

export const FailureContent = z.object({
  time: z.string(),
  status: TelemetryFailureStatus,
});
export type FailureContent = z.infer<typeof FailureContent>;
