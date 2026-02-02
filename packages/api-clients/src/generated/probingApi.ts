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

export const EserviceStateBE = z.enum(["ACTIVE", "INACTIVE"]);
export type EserviceStateBE = z.infer<typeof EserviceStateBE>;

export const ChangeEserviceStateRequest = z.object({
  eServiceState: EserviceStateBE,
});
export type ChangeEserviceStateRequest = z.infer<
  typeof ChangeEserviceStateRequest
>;

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

export const EserviceStateFE = z.enum(["ONLINE", "OFFLINE", "N_D"]);
export type EserviceStateFE = z.infer<typeof EserviceStateFE>;

export const SearchEserviceContent = z
  .object({
    eserviceRecordId: z.number().int(),
    eserviceName: z.string(),
    producerName: z.string(),
    responseReceived: z.string().datetime({ offset: true }),
    state: EserviceStateFE,
    versionNumber: z.number().int().gte(1),
  })
  .partial();
export type SearchEserviceContent = z.infer<typeof SearchEserviceContent>;

export const SearchEserviceResponse = z
  .object({
    content: z.array(SearchEserviceContent),
    offset: z.number().int(),
    limit: z.number().int(),
    totalElements: z.number().int(),
  })
  .partial();
export type SearchEserviceResponse = z.infer<typeof SearchEserviceResponse>;

export const SearchProducerNameResponse = z
  .object({ label: z.string(), value: z.string() })
  .partial();
export type SearchProducerNameResponse = z.infer<
  typeof SearchProducerNameResponse
>;

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
  state: EserviceStateFE,
  responseReceived: z.string().datetime({ offset: true }).optional(),
  eserviceActive: z.boolean(),
});
export type ProbingDataEserviceResponse = z.infer<
  typeof ProbingDataEserviceResponse
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
        status: 404,
        description: `The e-service hasn&#x27;t been found`,
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
        status: 404,
        description: `The e-service hasn&#x27;t been found`,
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
        status: 404,
        description: `The e-service hasn&#x27;t been found`,
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
    path: "/eservices",
    alias: "searchEservices",
    description: `Retrieve e-services by filters`,
    requestFormat: "json",
    parameters: [
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
        schema: z.array(EserviceStateFE).optional(),
      },
    ],
    response: SearchEserviceResponse,
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
    path: "/producers",
    alias: "getEservicesProducers",
    description: `Retrieve e-services producers`,
    requestFormat: "json",
    parameters: [
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
    response: z.array(SearchProducerNameResponse),
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
    path: "/eservices/mainData/:eserviceRecordId",
    alias: "getEserviceMainData",
    description: `Retrieve e-service main data`,
    requestFormat: "json",
    parameters: [
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
        status: 404,
        description: `The e-service hasn&#x27;t been found`,
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
    path: "/eservices/probingData/:eserviceRecordId",
    alias: "getEserviceProbingData",
    description: `Retrieve e-service probing data`,
    requestFormat: "json",
    parameters: [
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
        status: 404,
        description: `The e-service hasn&#x27;t been found`,
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
