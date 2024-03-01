import { ZodiosBodyByPath, ZodiosQueryParamsByPath, ZodiosResponseByPath } from "@zodios/core";
import { api } from "./generated/api.js";

export type Api = typeof api.api;

export type ApiUpdateEserviceStatePayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;

export type ApiUpdateEserviceStateResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;

export type ApiUpdateEserviceProbingStatePayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;


export type ApiUpdateEserviceProbingStateResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;

export type ApiUpdateEserviceFrequencyPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;

export type ApiUpdateEserviceFrequencyResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;

export type ApiSaveEservicePayload = ZodiosBodyByPath<
  Api,
  "put",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiSaveEserviceResponse = ZodiosResponseByPath<
  Api,
  "put",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiUpdateLastRequestQuery = ZodiosQueryParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;

export type ApiUpdateLastRequestPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;

export type ApiUpdateLastRequestResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;

export type ApiUpdateResponseReceivedResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateResponseReceived"
>;

export type ApiUpdateResponseReceivedPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateResponseReceived"
>;

export type ApiSearchEservicesQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/eservices"
>;

export type ApiSearchEservicesResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices"
>;

export type ApiGetEservicesReadyForPollingQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/eservices/polling"
>;

export type ApiGetEservicesReadyForPollingResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/polling"
>;

export type ApiGetProducersQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/producers"
>;

export type ApiGetProducersResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/producers"
>;

export type ApiEserviceProbingDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;


export type ApiEserviceMainDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;