import {
  ZodiosBodyByPath,
  ZodiosHeaderParamsByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
  ZodiosResponseByPath,
} from "@zodios/core";
import { api } from "./model/generated/client.js";

export type Api = typeof api.api;

/* 
  =========================================
  E-SERVICES API  
  =========================================
*/

// ---------- Update State ----------
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

// ---------- Update Response Received ----------
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

// ---------- Update Last Request ----------
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

// ---------- Save eService ----------
export type ApiSaveEserviceParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
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
export type ApiSaveEserviceResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

// ---------- Delete eService ----------
export type ApiDeleteEserviceParams = ZodiosPathParamsByPath<
  Api,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;
export type ApiDeleteEserviceHeaders = ZodiosHeaderParamsByPath<
  Api,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;
export type ApiDeleteEserviceResponse = ZodiosResponseByPath<
  Api,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;

// ---------- Search / List eServices ----------
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

// ---------- Eservices Ready for Polling ----------
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

// ---------- Eservice Data ----------
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

// ---------- List Producers ----------
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

/* 
  =========================================
  TENANTS API  
  =========================================
*/

// ---------- Save Tenant ----------
export type ApiSaveTenantParams = ZodiosPathParamsByPath<
  Api,
  "post",
  "/tenants/:tenantId/saveTenant"
>;
export type ApiSaveTenantHeaders = ZodiosHeaderParamsByPath<
  Api,
  "post",
  "/tenants/:tenantId/saveTenant"
>;
export type ApiSaveTenantPayload = ZodiosBodyByPath<
  Api,
  "post",
  "/tenants/:tenantId/saveTenant"
>;
export type ApiSaveTenantResponse = ZodiosResponseByPath<
  Api,
  "post",
  "/tenants/:tenantId/saveTenant"
>;

// ---------- Delete Tenant ----------
export type ApiDeleteTenantParams = ZodiosPathParamsByPath<
  Api,
  "delete",
  "/tenants/:tenantId/deleteTenant"
>;
export type ApiDeleteTenantHeaders = ZodiosHeaderParamsByPath<
  Api,
  "delete",
  "/tenants/:tenantId/deleteTenant"
>;
export type ApiDeleteTenantResponse = ZodiosResponseByPath<
  Api,
  "delete",
  "/tenants/:tenantId/deleteTenant"
>;
