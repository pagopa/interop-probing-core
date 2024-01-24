import { ZodiosBodyByPath } from "@zodios/core";
import { api } from "./generated/api.js";

type Api = typeof api.api;

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

