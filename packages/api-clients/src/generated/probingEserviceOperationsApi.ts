import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

export const EserviceInteropState = z.enum(["ACTIVE", "INACTIVE"]);
export type EserviceInteropState = z.infer<typeof EserviceInteropState>;

export const ChangeEserviceStateRequest = z.object({
  eServiceState: EserviceInteropState,
});
export type ChangeEserviceStateRequest = z.infer<
  typeof ChangeEserviceStateRequest
>;

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
  correlationId: z.string().max(64).optional(),
  detail: z
    .string()
    .max(4096)
    .regex(/^.{0,1024}$/)
    .optional(),
  errors: z.array(ProblemError).min(1).optional(),
});
export type Problem = z.infer<typeof Problem>;

export const ChangeProbingStateRequest = z.object({
  probingEnabled: z.boolean(),
});
export type ChangeProbingStateRequest = z.infer<
  typeof ChangeProbingStateRequest
>;

export const ChangeProbingFrequencyRequest = z.object({
  frequency: z.number().int().gte(1),
  startTime: z.string(),
  endTime: z.string(),
});
export type ChangeProbingFrequencyRequest = z.infer<
  typeof ChangeProbingFrequencyRequest
>;

export const EserviceMonitorState = z.enum(["ONLINE", "OFFLINE", "N_D"]);
export type EserviceMonitorState = z.infer<typeof EserviceMonitorState>;

export const EserviceStatus = z.enum(["OK", "KO"]);
export type EserviceStatus = z.infer<typeof EserviceStatus>;

export const EserviceTechnology = z.enum(["REST", "SOAP"]);
export type EserviceTechnology = z.infer<typeof EserviceTechnology>;

export const EserviceContent = z.object({
  eserviceRecordId: z.number().int(),
  eserviceName: z.string(),
  producerName: z.string(),
  state: EserviceInteropState,
  responseReceived: z.string().datetime({ offset: true }).optional(),
  lastRequest: z.string().datetime({ offset: true }).optional(),
  responseStatus: EserviceStatus.optional(),
  versionNumber: z.number().int().gte(1),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  pollingFrequency: z.number().int(),
  probingEnabled: z.boolean(),
  audience: z.array(z.string()),
});
export type EserviceContent = z.infer<typeof EserviceContent>;

export const SearchEserviceResponse = z.object({
  content: z.array(EserviceContent),
  offset: z.number().int().optional(),
  limit: z.number().int().optional(),
  totalElements: z.number().int(),
});
export type SearchEserviceResponse = z.infer<typeof SearchEserviceResponse>;

export const MainDataEserviceResponse = z
  .object({
    eserviceName: z.string(),
    versionNumber: z.number().int().gte(1),
    producerName: z.string(),
    pollingFrequency: z.number().int(),
    versionId: z.string().uuid(),
    eserviceId: z.string().uuid(),
  })
  .partial();
export type MainDataEserviceResponse = z.infer<typeof MainDataEserviceResponse>;

export const ProbingDataEserviceResponse = z.object({
  probingEnabled: z.boolean(),
  state: EserviceInteropState,
  responseReceived: z.string().datetime({ offset: true }).nullish(),
  lastRequest: z.string().datetime({ offset: true }).nullish(),
  responseStatus: EserviceStatus.nullish(),
  pollingFrequency: z.number().int(),
});
export type ProbingDataEserviceResponse = z.infer<
  typeof ProbingDataEserviceResponse
>;

export const SearchProducerNameResponse = z.object({
  content: z.array(z.string()),
});
export type SearchProducerNameResponse = z.infer<
  typeof SearchProducerNameResponse
>;

export const EserviceSaveRequest = z.object({
  name: z.string(),
  producerId: z.string().uuid(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  state: EserviceInteropState,
  versionNumber: z.number().int().gte(1),
  audience: z.array(z.string()),
});
export type EserviceSaveRequest = z.infer<typeof EserviceSaveRequest>;

export const PollingResource = z.object({
  eserviceRecordId: z.number().int(),
  basePath: z.array(z.string()),
  technology: EserviceTechnology,
  audience: z.array(z.string()),
});
export type PollingResource = z.infer<typeof PollingResource>;

export const PollingEserviceResponse = z.object({
  content: z.array(PollingResource),
  totalElements: z.number().int(),
});
export type PollingEserviceResponse = z.infer<typeof PollingEserviceResponse>;

export const ChangeLastRequest = z.object({
  lastRequest: z.string().datetime({ offset: true }),
});
export type ChangeLastRequest = z.infer<typeof ChangeLastRequest>;

export const ChangeResponseReceived = z.object({
  responseReceived: z.string().datetime({ offset: true }),
  status: EserviceStatus,
});
export type ChangeResponseReceived = z.infer<typeof ChangeResponseReceived>;

export const SaveTenantRequest = z.object({ name: z.string() });
export type SaveTenantRequest = z.infer<typeof SaveTenantRequest>;

export const CorrelationId = z.string();
export type CorrelationId = z.infer<typeof CorrelationId>;

export const Producer = z.object({ producerName: z.string() }).partial();
export type Producer = z.infer<typeof Producer>;

export const EServicesEndpoints = makeApi([
  {
    method: "post",
    path: "/eservices/:eserviceId/versions/:versionId/updateState",
    alias: "updateEserviceState",
    description: `Updates the state of the e-service identified by its id and version id.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChangeEserviceStateRequest,
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceId",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "versionId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `Resource Not Found`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "post",
    path: "/eservices/:eserviceId/versions/:versionId/probing/updateState",
    alias: "updateEserviceProbingState",
    description: `Activates or deactivates the probing polling process for the e-service identified by its id and version id`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ probingEnabled: z.boolean() }),
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceId",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "versionId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `Resource Not Found`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "post",
    path: "/eservices/:eserviceId/versions/:versionId/updateFrequency",
    alias: "updateEserviceFrequency",
    description: `Updates the frequency and the time interval of the polling process for the e-service identified by its id and version id`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChangeProbingFrequencyRequest,
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceId",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "versionId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `Resource Not Found`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "get",
    path: "/eservices",
    alias: "searchEservices",
    description: `Retrieve e-services by filters`,
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0),
      },
      {
        name: "eserviceName",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "producerName",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "versionNumber",
        type: "Query",
        schema: z.number().int().gte(1).optional(),
      },
      {
        name: "state",
        type: "Query",
        schema: z.array(EserviceMonitorState).optional(),
      },
    ],
    response: SearchEserviceResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "get",
    path: "/eservices/mainData/:eserviceRecordId",
    alias: "getEserviceMainData",
    description: `Retrieve e-service main data`,
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceRecordId",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: MainDataEserviceResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `Resource Not Found`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "get",
    path: "/eservices/probingData/:eserviceRecordId",
    alias: "getEserviceProbingData",
    description: `Retrieve e-service probing data`,
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceRecordId",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ProbingDataEserviceResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `Resource Not Found`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "get",
    path: "/producers",
    alias: "getEservicesProducers",
    description: `Retrieve e-services producers`,
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0),
      },
      {
        name: "producerName",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: SearchProducerNameResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "post",
    path: "/eservices/:eserviceId/versions/:versionId/saveEservice",
    alias: "saveEservice",
    description: `Create or Update the EService Version, with corresponding details`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EserviceSaveRequest,
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceId",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "versionId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "delete",
    path: "/eservices/:eserviceId/deleteEservice",
    alias: "deleteEservice",
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "get",
    path: "/eservices/polling",
    alias: "getEservicesReadyForPolling",
    description: `Retrieve e-services ready for polling`,
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0),
      },
    ],
    response: PollingEserviceResponse,
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "post",
    path: "/eservices/:eserviceRecordId/updateLastRequest",
    alias: "updateEserviceLastRequest",
    description: `Update last request of the eservice`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          lastRequest: z.string().datetime({ offset: true }),
        }),
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceRecordId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "post",
    path: "/eservices/:eserviceRecordId/updateResponseReceived",
    alias: "updateEserviceResponseReceived",
    description: `Update response received of the eservice`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ChangeResponseReceived,
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "eserviceRecordId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
]);

export const EServicesApi = new Zodios(EServicesEndpoints);

export function createEServicesApiClient(
  baseUrl: string,
  options?: ZodiosOptions
) {
  const zodiosClient = new Zodios(baseUrl, EServicesEndpoints, {
    ...options,
  });

  return zodiosClient;
}

export const TenantsEndpoints = makeApi([
  {
    method: "post",
    path: "/tenants/:tenantId/saveTenant",
    alias: "saveTenant",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string() }),
      },
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "tenantId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
  {
    method: "delete",
    path: "/tenants/:tenantId/deleteTenant",
    alias: "deleteTenant",
    requestFormat: "json",
    parameters: [
      {
        name: "x-correlation-id",
        type: "Header",
        schema: z.string().uuid(),
      },
      {
        name: "tenantId",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `The provided input data is invalid`,
        schema: Problem,
      },
      {
        status: 404,
        description: `The requested resource could not be found on the server`,
        schema: Problem,
      },
      {
        status: 500,
        description: `A managed error has occurred during the request elaboration`,
        schema: Problem,
      },
    ],
  },
]);

export const TenantsApi = new Zodios(TenantsEndpoints);

export function createTenantsApiClient(
  baseUrl: string,
  options?: ZodiosOptions
) {
  const zodiosClient = new Zodios(baseUrl, TenantsEndpoints, {
    ...options,
  });

  return zodiosClient;
}
