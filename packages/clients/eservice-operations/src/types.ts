import {
  ZodiosBodyByPath,
  ZodiosHeaderParamsByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
  ZodiosResponseByPath,
} from "@zodios/core";
import { api } from "./model/generated/client.js";

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

export type ApiUpdateResponseReceivedPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateResponseReceived"
>;

export type ApiUpdateResponseReceivedResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateResponseReceived"
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

export type ApiGetEserviceProbingDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;

export type ApiGetEserviceMainDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;

export type ApiUpdateLastRequestParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;

export type ApiUpdateLastRequestHeaders = ZodiosHeaderParamsByPath<
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

export type ApiGetEservicesReadyForPollingHeaders = ZodiosHeaderParamsByPath<
  Api,
  "get",
  "/eservices/polling"
>;

export type ApiGetEservicesReadyForPollingResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/polling"
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

export type ApiSaveEserviceHeaders = ZodiosHeaderParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiSaveEservicePayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiSaveEserviceParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiSaveEserviceResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiDeleteEserviceHeaders = ZodiosHeaderParamsByPath<
  Api,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;

export type ApiDeleteEserviceParams = ZodiosPathParamsByPath<
  Api,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;

export type ApiDeleteEserviceResponse = ZodiosResponseByPath<
  Api,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;
