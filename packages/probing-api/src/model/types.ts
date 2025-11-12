import {
  ZodiosBodyByPath,
  ZodiosHeaderParamsByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
  ZodiosResponseByPath,
} from "@zodios/core";
import { api } from "./generated/api.js";

export type ProbingApi = typeof api.api;

/* 
  =========================================
  E-SERVICES API  
  =========================================
*/

// ---------- Update State ----------
export type ProbingApiUpdateEserviceStateParams = ZodiosPathParamsByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;
export type ProbingApiUpdateEserviceStateHeaders = ZodiosHeaderParamsByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;
export type ProbingApiUpdateEserviceStatePayload = ZodiosBodyByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;
export type ProbingApiUpdateEserviceStateResponse = ZodiosResponseByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;

// ---------- Update Probing State ----------
export type ProbingApiUpdateEserviceProbingStateParams = ZodiosPathParamsByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;
export type ProbingApiUpdateEserviceProbingStateHeaders =
  ZodiosHeaderParamsByPath<
    ProbingApi,
    "post",
    "/eservices/:eserviceId/versions/:versionId/probing/updateState"
  >;
export type ProbingApiUpdateEserviceProbingStatePayload = ZodiosBodyByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;
export type ProbingApiUpdateEserviceProbingStateResponse = ZodiosResponseByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;

// ---------- Update Frequency ----------
export type ProbingApiUpdateEserviceFrequencyParams = ZodiosPathParamsByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;
export type ProbingApiUpdateEserviceFrequencyHeaders = ZodiosHeaderParamsByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;
export type ProbingApiUpdateEserviceFrequencyPayload = ZodiosBodyByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;
export type ProbingApiUpdateEserviceFrequencyResponse = ZodiosResponseByPath<
  ProbingApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;

// ---------- Search / List eServices ----------
export type ProbingApiSearchEservicesQuery = ZodiosQueryParamsByPath<
  ProbingApi,
  "get",
  "/eservices"
>;
export type ProbingApiSearchEservicesHeaders = ZodiosHeaderParamsByPath<
  ProbingApi,
  "get",
  "/eservices"
>;
export type ProbingApiSearchEservicesResponse = ZodiosResponseByPath<
  ProbingApi,
  "get",
  "/eservices"
>;

// ---------- Eservice Main Data ----------
export type ProbingApiGetEserviceMainDataParams = ZodiosPathParamsByPath<
  ProbingApi,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;
export type ProbingApiGetEserviceMainDataHeaders = ZodiosHeaderParamsByPath<
  ProbingApi,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;
export type ProbingApiGetEserviceMainDataResponse = ZodiosResponseByPath<
  ProbingApi,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;

// ---------- Eservice Probing Data ----------
export type ProbingApiGetEserviceProbingDataParams = ZodiosPathParamsByPath<
  ProbingApi,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;
export type ProbingApiGetEserviceProbingDataHeaders = ZodiosHeaderParamsByPath<
  ProbingApi,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;
export type ProbingApiGetEserviceProbingDataResponse = ZodiosResponseByPath<
  ProbingApi,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;

/* 
  =========================================
  PRODUCERS API  
  =========================================
*/

export type ProbingApiGetProducersQuery = ZodiosQueryParamsByPath<
  ProbingApi,
  "get",
  "/producers"
>;
export type ProbingApiGetProducersHeaders = ZodiosHeaderParamsByPath<
  ProbingApi,
  "get",
  "/producers"
>;
export type ProbingApiGetProducersResponse = ZodiosResponseByPath<
  ProbingApi,
  "get",
  "/producers"
>;

/* 
  =========================================
  STATUS API  
  =========================================
*/

export type ProbingApiGetHealthStatusResponse = ZodiosResponseByPath<
  ProbingApi,
  "get",
  "/status"
>;
