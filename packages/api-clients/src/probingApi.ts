import {
  ZodiosBodyByPath,
  ZodiosHeaderParamsByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
  ZodiosResponseByPath,
} from "@zodios/core";
import * as probingApi from "./generated/probingApi.js";

export type Api = typeof probingApi.EServicesApi.api;

/* 
  =========================================
  E-SERVICES API  
  =========================================
*/

// ---------- Update State ----------
export type ApiUpdateEserviceStateParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;
export type ApiUpdateEserviceStateHeaders = ZodiosHeaderParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;
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

// ---------- Update Probing State ----------
export type ApiUpdateEserviceProbingStateParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;
export type ApiUpdateEserviceProbingStateHeaders = ZodiosHeaderParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
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

// ---------- Update Frequency ----------
export type ApiUpdateEserviceFrequencyParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;
export type ApiUpdateEserviceFrequencyHeaders = ZodiosHeaderParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
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

// ---------- Search / List eServices ----------
export type ApiSearchEservicesQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/eservices"
>;
export type ApiSearchEservicesHeaders = ZodiosHeaderParamsByPath<
  Api,
  "get",
  "/eservices"
>;
export type ApiSearchEservicesResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices"
>;

// ---------- Eservice Main Data ----------
export type ApiGetEserviceMainDataParams = ZodiosPathParamsByPath<
  Api,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;
export type ApiGetEserviceMainDataHeaders = ZodiosHeaderParamsByPath<
  Api,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;
export type ApiGetEserviceMainDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;

// ---------- Eservice Probing Data ----------
export type ApiGetEserviceProbingDataParams = ZodiosPathParamsByPath<
  Api,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;
export type ApiGetEserviceProbingDataHeaders = ZodiosHeaderParamsByPath<
  Api,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;
export type ApiGetEserviceProbingDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;

/* 
  =========================================
  PRODUCERS API  
  =========================================
*/

export type ApiGetProducersQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/producers"
>;
export type ApiGetProducersHeaders = ZodiosHeaderParamsByPath<
  Api,
  "get",
  "/producers"
>;
export type ApiGetProducersResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/producers"
>;

export * from "./generated/probingApi.js";
