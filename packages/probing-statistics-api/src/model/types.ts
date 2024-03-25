import { ZodiosPathParamsByPath, ZodiosQueryParamsByPath, ZodiosResponseByPath } from "@zodios/core";
import { api } from "./generated/api.js";

export type Api = typeof api.api;

export type ApiStatisticsEservicesQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/telemetryData/eservices/:eserviceRecordId"
>;

export type ApiStatisticsEservicesParams = ZodiosPathParamsByPath<
  Api,
  "get",
  "/telemetryData/eservices/:eserviceRecordId"
>;

export type ApiStatisticsEservicesResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/telemetryData/eservices/:eserviceRecordId"
>;

export type ApiFilteredStatisticsEservicesQuery = ZodiosQueryParamsByPath<
  Api,
  "get",
  "/telemetryData/eservices/filtered/:eserviceRecordId"
>;

export type ApiFilteredStatisticsEservicesParams = ZodiosPathParamsByPath<
  Api,
  "get",
  "/telemetryData/eservices/filtered/:eserviceRecordId"
>;

export type ApiFilteredStatisticsEservicesResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/telemetryData/eservices/filtered/:eserviceRecordId"
>;