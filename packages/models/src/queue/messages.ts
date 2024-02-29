import { z } from "zod";
import { EserviceStatus, EserviceTechnology, responseStatus } from "../eservice/eservice.js";

export const PollingDto = z.object({
  eserviceRecordId: z.number().min(1),
  status: EserviceStatus,
  responseReceived: z.string().datetime({ offset: true }),
});

export type PollingDto = z.infer<typeof PollingDto>;

export const TelemetryOkDto = z.object({
  status: z.literal(responseStatus.ok),
  eserviceRecordId: z.number().min(1),
  checkTime: z.string().regex(/^\d+$/).min(1),
  responseTime: z.number(),
});

export type TelemetryOkDto = z.infer<typeof TelemetryOkDto>;

export const TelemetryKoDto = z.object({
  status: z.literal(responseStatus.ko),
  eserviceRecordId: z.number().min(1),
  checkTime: z.string().regex(/^\d+$/).min(1),
  responseTime: z.number().optional(),
  koReason: z.string().min(1).max(2048),
});

export type TelemetryKoDto = z.infer<typeof TelemetryKoDto>;

export const TelemetryDto = z.discriminatedUnion("status", [
  TelemetryOkDto,
  TelemetryKoDto,
]);

export type TelemetryDto = z.infer<typeof TelemetryDto>;

export const EserviceContentDto = z.object({
  eserviceRecordId: z.number(),
  technology: EserviceTechnology,
  basePath: z.array(z.string()),
  audience: z.array(z.string()),
});

export type EserviceContentDto = z.infer<typeof EserviceContentDto>;