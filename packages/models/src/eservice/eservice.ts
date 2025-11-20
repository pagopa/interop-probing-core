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
  n_d: "N_D",
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
  frequency: z.number().int().gte(1),
  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
      "Invalid time format, expected HH:mm:ss",
    ),
  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
      "Invalid time format, expected HH:mm:ss",
    ),
});
export type ChangeProbingFrequencyRequest = z.infer<
  typeof ChangeProbingFrequencyRequest
>;

export const EserviceProbingUpdateLastRequest = z.object({
  lastRequest: z.string().datetime({ offset: true }),
});
export type EserviceProbingUpdateLastRequest = z.infer<
  typeof EserviceProbingUpdateLastRequest
>;

export const ChangeResponseReceived = z.object({
  responseReceived: z.string().datetime({ offset: true }),
  responseStatus: EserviceStatus,
});
export type ChangeResponseReceived = z.infer<typeof ChangeResponseReceived>;

export const EserviceSaveRequest = z.object({
  eserviceName: z.string(),
  producerId: z.string(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  state: EserviceInteropState,
  versionNumber: z.number().int(),
  audience: z.array(z.string()),
});
export type EserviceSaveRequest = z.infer<typeof EserviceSaveRequest>;

export const TenantSaveRequest = z.object({
  tenant_id: z.string(),
  tenant_name: z.string().optional(),
});
export type TenantSaveRequest = z.infer<typeof TenantSaveRequest>;

/**
 * Schema for EService.
 *
 * @remarks
 * - `eserviceRecordId`: In PostgreSQL, the primary key column type for eserviceRecordId is `bigint`, which returns a string.
 *   Due to the JavaScript limit for accurate representation of integers being 9007199254740991 (2^53),
 *   values exceeding this limit must be returned as strings.
 *   Despite this, the API Swagger documentation specifies a number type.
 *   We transform it to a number with the understanding that eservices' numbers are assumed
 *   to stay within the safe JavaScript integer limit.
 *   For more details, refer to: [TypeORM Issue #8583](https://github.com/typeorm/typeorm/issues/8583)
 *
 * @see EserviceInteropState - Enum representing the state of EService.
 * @see EserviceTechnology - Enum representing the technology of EService.
 *
 * @throws `ValidationError` if the input does not conform to the defined schema.
 */
export const EService = z.object({
  eserviceRecordId: z.string().transform((value) => Number(value)),
  eserviceId: z.string().uuid(),
  versionId: z.string().uuid(),
  eserviceName: z.string(),
  producerName: z.string(),
  state: EserviceInteropState,
  versionNumber: z.number().int(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  pollingFrequency: z.number().int().min(1).default(5).optional(),
  probingEnabled: z.boolean(),
  audience: z.array(z.string()),
  pollingStartTime: z.string(),
  pollingEndTime: z.string(),
  lockVersion: z.number(),
});
export type EService = z.infer<typeof EService>;

/**
 * Schema for EService Content.
 *
 * @remarks
 * This schema defines the structure of content related to the EService entity,
 * specifically designed for response payloads or content representations.
 *
 * - `eserviceRecordId`: This field is transformed using the `transform` utility to ensure
 *   that the value matches the expected response schema of OpenAPI. The transformation
 *   involves parsing the input as a string and converting it to a number.
 *   For more details, refer to: [EService schema declaration](link_to_EService_schema_declaration)
 *
 * @see EService - Entity schema for EService, includes details about `eserviceRecordId`.
 * @see EserviceInteropState - Enum representing the state of EService.
 * @see EserviceTechnology - Enum representing the technology of EService.
 * @see EserviceStatus - Enum representing the status of EService.
 *
 * @throws `ValidationError` if the input does not conform to the defined schema.
 */
export const EServiceContent = z.object({
  eserviceRecordId: z.string().transform((value) => Number(value)),
  eserviceName: z.string(),
  producerName: z.string(),
  state: EserviceInteropState,
  responseReceived: z
    .string()
    .transform((date) => new Date(date).toISOString())
    .nullish()
    .transform((value) => (value === null ? undefined : value))
    .optional(),
  lastRequest: z
    .string()
    .transform((date) => new Date(date).toISOString())
    .nullish()
    .transform((value) => (value === null ? undefined : value))
    .optional(),
  responseStatus: EserviceStatus.nullish()
    .transform((value) => (value === null ? undefined : value))
    .optional(),
  versionNumber: z.number().int(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  pollingFrequency: z.number().int(),
  probingEnabled: z.boolean(),
  audience: z.array(z.string()),
});

export type EServiceContent = z.infer<typeof EServiceContent>;

export const PollingResource = z.object({
  eserviceRecordId: z.string().transform((value) => Number(value)),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  audience: z.array(z.string()),
});

export type PollingResource = z.infer<typeof PollingResource>;

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
  responseReceived: z
    .string()
    .transform((date) => new Date(date).toISOString())
    .nullish(),
  lastRequest: z
    .string()
    .transform((date) => new Date(date).toISOString())
    .nullish(),
  responseStatus: EserviceStatus.nullish(),
  pollingFrequency: z.number().int(),
});
export type EServiceProbingData = z.infer<typeof EServiceProbingData>;
