import { z } from "zod";

export const TelemetryMeasurement = {
  TELEMETRY: "telemetry",
} as const;
export type TelemetryMeasurement =
  (typeof TelemetryMeasurement)[keyof typeof TelemetryMeasurement];

export const TelemetryFields = {
  TIME: "time",
  STATUS: "status",
  RESPONSE_TIME: "response_time",
} as const;
export type TelemetryFields =
  (typeof TelemetryFields)[keyof typeof TelemetryFields];

export const TelemetryDimensions = {
  ESERVICE_RECORD_ID: "eservice_record_id",
  KO_REASON: "ko_reason",
} as const;
export type TelemetryDimensions =
  (typeof TelemetryDimensions)[keyof typeof TelemetryDimensions];

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

export const TelemetryPoint = z.object({
  responseTime: z.number().int().nullable().optional(),
  status: TelemetryStatus,
  time: z.string(),
});
export type TelemetryPoint = z.infer<typeof TelemetryPoint>;
