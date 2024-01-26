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

export const ChangeEserviceProbingStateRequest = z.object({
  probingEnabled: z.boolean(),
});
export type ChangeEserviceProbingStateRequest = z.infer<
  typeof ChangeEserviceProbingStateRequest
>;

export const ChangeEserviceStateRequest = z.object({
  state: EserviceInteropState,
});

export type ChangeEserviceStateRequest = z.infer<
  typeof ChangeEserviceStateRequest
>;

export const ChangeProbingFrequencyRequest = z.object({
  pollingFrequency: z.number().int().gte(1).default(5),
});

export type ChangeProbingFrequencyRequest = z.infer<
  typeof ChangeProbingFrequencyRequest
>;

export const EserviceProbingUpdateLastRequest = z.object({
  lastRequest: z.string().datetime({ offset: true })
});
export type EserviceProbingUpdateLastRequest = z.infer<typeof EserviceProbingUpdateLastRequest>;

export const ChangeResponseReceived = z.object({
  responseReceived: z.string().datetime({ offset: true }),
  responseStatus: EserviceStatus,
});
export type ChangeResponseReceived = z.infer<typeof ChangeResponseReceived>;

export const EserviceSaveRequest = z.object({
  eserviceName: z.string(),
  producerName: z.string(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  state: EserviceInteropState,
  versionNumber: z.number().int(),
  audience: z.array(z.string()),
});
export type EserviceSaveRequest = z.infer<typeof EserviceSaveRequest>;

export const EService = z.object({
  eserviceRecordId: z.number().int(),
  eserviceId: z.string().uuid(),
  versionId: z.string().uuid(),
  eserviceName: z.string(),
  producerName: z.string(),
  state: EserviceInteropState,
  responseReceived: z.string().datetime({ offset: true }),
  lastRequest: z.string().datetime({ offset: true }),
  responseStatus: EserviceStatus,
  versionNumber: z.number().int(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  pollingFrequency: z.number().int().gte(1).default(5).optional(),
  probingEnabled: z.boolean(),
  audience: z.array(z.string()),
  pollingStartTime: z.string(),
  pollingEndTime: z.string(),
});
export type EService = z.infer<typeof EService>;

export const EServiceContent = z.object({
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
export type EServiceContent = z.infer<typeof EServiceContent>;

export const EServiceMainData = z.object({
  eserviceName: z.string(),
  producerName: z.string(),
  versionNumber: z.number().int(),
  pollingFrequency: z.number().int(),
  versionId: z.string().uuid(),
  eserviceId: z.string().uuid(),
});
export type EServiceMainData = z.infer<typeof EServiceMainData>;

export const EServiceProbingData = z.object({
  probingEnabled: z.boolean(),
  state: EserviceInteropState,
  responseReceived: z.string().datetime({ offset: true }),
  lastRequest: z.string().datetime({ offset: true }),
  responseStatus: EserviceStatus,
  pollingFrequency: z.number().int(),
});
export type EServiceProbingData = z.infer<typeof EServiceProbingData>;
