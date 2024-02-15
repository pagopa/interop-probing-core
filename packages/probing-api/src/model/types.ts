import { ZodiosBodyByPath, ZodiosResponseByPath } from "@zodios/core";
import { api } from "./generated/api.js";

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

export type ApiGetEservicesResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices"
>;

export type ApiGetEserviceMainDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/mainData/:eserviceRecordId"
>;

export type ApiGetEserviceProbingDataResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/eservices/probingData/:eserviceRecordId"
>;

export type ApiGetProducersResponse = ZodiosResponseByPath<
  Api,
  "get",
  "/producers"
>;
