import {
  ZodiosBodyByPath,
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

export type ApiUpdateEserviceProbingStatePayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;

export type ApiUpdateEserviceFrequencyPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;

export type ApiSaveEservicePayload = ZodiosBodyByPath<
  Api,
  "put",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

export type ApiUpdateLastRequestPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
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

export type ApiSearchEservicesQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/eservices"
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

export type ApiSearchEservicesResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices"
>;
