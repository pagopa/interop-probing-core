import z from "zod";

export const responseStatus = {
  ok: "OK",
  ko: "KO",
} as const;
export const EserviceStatus = z.enum([
  Object.values(responseStatus)[0],
  ...Object.values(responseStatus).slice(1),
]);
export type EserviceStatus = z.infer<typeof EserviceStatus>;

export const eserviceInteropState = {
  active: "ACTIVE",
  inactive: "INACTIVE",
} as const;
export const EserviceInteropState = z.enum([
  Object.values(eserviceInteropState)[0],
  ...Object.values(eserviceInteropState).slice(1),
]);
export type EserviceInteropState = z.infer<typeof EserviceInteropState>;

export const eserviceMonitorState = {
  online: "ONLINE",
  offline: "OFFLINE",
  "n/d": "N/D",
} as const;
export const EserviceMonitorState = z.enum([
  Object.values(eserviceMonitorState)[0],
  ...Object.values(eserviceMonitorState).slice(1),
]);
export type EserviceMonitorState = z.infer<typeof EserviceMonitorState>;

export const technology = { rest: "REST", soap: "SOAP" } as const;
export const EserviceTechnology = z.enum([
  Object.values(technology)[0],
  ...Object.values(technology).slice(1),
]);
export type EserviceTechnology = z.infer<typeof EserviceTechnology>;

export const EServiceProducer = z.object({
  eserviceRecordId: z.number().int(),
  eserviceName: z.string(),
  producerName: z.string(),
  state: EserviceInteropState,
  responseReceived: z.string().datetime({ offset: true }),
  lastRequest: z.string().datetime({ offset: true }),
  responseStatus: EserviceStatus,
  versionNumber: z.number().int(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  pollingFrequency: z.number().int(),
  probingEnabled: z.boolean(),
  audience: z.array(z.string()),
});
export type EServiceProducer = z.infer<typeof EServiceProducer>;
