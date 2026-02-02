import {
  ZodiosBodyByPath,
  ZodiosHeaderParamsByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
  ZodiosResponseByPath,
} from "@zodios/core";
import * as probingEserviceOperationsApi from "./generated/probingEserviceOperationsApi.js";

export type EServiceApi = typeof probingEserviceOperationsApi.EServicesApi.api;
export type TenantApi = typeof probingEserviceOperationsApi.TenantsApi.api;

/* 
  =========================================
  E-SERVICES API  
  =========================================
*/

// ---------- Update State ----------
export type ApiUpdateEserviceStatePayload = ZodiosBodyByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;
export type ApiUpdateEserviceStateResponse = ZodiosResponseByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateState"
>;

// ---------- Update Probing State ----------
export type ApiUpdateEserviceProbingStatePayload = ZodiosBodyByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;
export type ApiUpdateEserviceProbingStateResponse = ZodiosResponseByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/probing/updateState"
>;

// ---------- Update Frequency ----------
export type ApiUpdateEserviceFrequencyPayload = ZodiosBodyByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;
export type ApiUpdateEserviceFrequencyResponse = ZodiosResponseByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/updateFrequency"
>;

// ---------- Update Response Received ----------
export type ApiUpdateResponseReceivedPayload = ZodiosBodyByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceRecordId/updateResponseReceived"
>;
export type ApiUpdateResponseReceivedResponse = ZodiosResponseByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceRecordId/updateResponseReceived"
>;

// ---------- Update Last Request ----------
export type ApiUpdateLastRequestParams = ZodiosPathParamsByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;
export type ApiUpdateLastRequestHeaders = ZodiosHeaderParamsByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;
export type ApiUpdateLastRequestPayload = ZodiosBodyByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;
export type ApiUpdateLastRequestResponse = ZodiosResponseByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceRecordId/updateLastRequest"
>;

// ---------- Save eService ----------
export type ApiSaveEserviceParams = ZodiosPathParamsByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;
export type ApiSaveEserviceHeaders = ZodiosHeaderParamsByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;
export type ApiSaveEservicePayload = ZodiosBodyByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;
export type ApiSaveEserviceResponse = ZodiosResponseByPath<
  EServiceApi,
  "post",
  "/eservices/:eserviceId/versions/:versionId/saveEservice"
>;

// ---------- Delete eService ----------
export type ApiDeleteEserviceParams = ZodiosPathParamsByPath<
  EServiceApi,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;
export type ApiDeleteEserviceHeaders = ZodiosHeaderParamsByPath<
  EServiceApi,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;
export type ApiDeleteEserviceResponse = ZodiosResponseByPath<
  EServiceApi,
  "delete",
  "/eservices/:eserviceId/deleteEservice"
>;

// ---------- Search / List eServices ----------
export type ApiSearchEservicesQuery = ZodiosQueryParamsByPath<
  EServiceApi,
  "get",
  "/eservices"
>;
export type ApiSearchEservicesResponse = ZodiosResponseByPath<
  EServiceApi,
  "get",
  "/eservices"
>;

// ---------- Eservices Ready for Polling ----------
export type ApiGetEservicesReadyForPollingQuery = ZodiosQueryParamsByPath<
  EServiceApi,
  "get",
  "/eservices/polling"
>;
export type ApiGetEservicesReadyForPollingHeaders = ZodiosHeaderParamsByPath<
  EServiceApi,
  "get",
  "/eservices/polling"
>;
export type ApiGetEservicesReadyForPollingResponse = ZodiosResponseByPath<
  EServiceApi,
  "get",
  "/eservices/polling"
>;

// ---------- Eservice Data ----------
export type ApiGetEserviceProbingDataResponse = ZodiosResponseByPath<
  EServiceApi,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;
export type ApiGetEserviceMainDataResponse = ZodiosResponseByPath<
  EServiceApi,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;

// ---------- List Producers ----------
export type ApiGetProducersQuery = ZodiosQueryParamsByPath<
  EServiceApi,
  "get",
  "/producers"
>;
export type ApiGetProducersResponse = ZodiosResponseByPath<
  EServiceApi,
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
  TenantApi,
  "post",
  "/tenants/:tenantId/saveTenant"
>;
export type ApiSaveTenantHeaders = ZodiosHeaderParamsByPath<
  TenantApi,
  "post",
  "/tenants/:tenantId/saveTenant"
>;
export type ApiSaveTenantPayload = ZodiosBodyByPath<
  TenantApi,
  "post",
  "/tenants/:tenantId/saveTenant"
>;
export type ApiSaveTenantResponse = ZodiosResponseByPath<
  TenantApi,
  "post",
  "/tenants/:tenantId/saveTenant"
>;

// ---------- Delete Tenant ----------
export type ApiDeleteTenantParams = ZodiosPathParamsByPath<
  TenantApi,
  "delete",
  "/tenants/:tenantId/deleteTenant"
>;
export type ApiDeleteTenantHeaders = ZodiosHeaderParamsByPath<
  TenantApi,
  "delete",
  "/tenants/:tenantId/deleteTenant"
>;
export type ApiDeleteTenantResponse = ZodiosResponseByPath<
  TenantApi,
  "delete",
  "/tenants/:tenantId/deleteTenant"
>;

export * from "./generated/probingEserviceOperationsApi.js";
