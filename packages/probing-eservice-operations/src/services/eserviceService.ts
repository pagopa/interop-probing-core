import { logger } from "pagopa-interop-probing-commons";
import {
  ChangeResponseReceived,
  EserviceProbingUpdateLastRequest,
  EserviceSaveRequest,
} from "pagopa-interop-probing-models";
import { EserviceQuery } from "./db/eserviceQuery.js";
import {
  ApiEserviceMainDataResponse,
  ApiEserviceProbingDataResponse,
  ApiGetEservicesReadyForPollingQuery,
  ApiGetEservicesReadyForPollingResponse,
  ApiGetProducersQuery,
  ApiGetProducersResponse,
  ApiSaveEservicePayload,
  ApiSaveEserviceResponse,
  ApiSearchEservicesQuery,
  ApiSearchEservicesResponse,
  ApiUpdateEserviceFrequencyPayload,
  ApiUpdateEserviceFrequencyResponse,
  ApiUpdateEserviceProbingStatePayload,
  ApiUpdateEserviceProbingStateResponse,
  ApiUpdateEserviceStatePayload,
  ApiUpdateEserviceStateResponse,
  ApiUpdateLastRequestPayload,
  ApiUpdateLastRequestResponse,
  ApiUpdateResponseReceivedPayload,
  ApiUpdateResponseReceivedResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { eServiceNotFound } from "../model/domain/errors.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-params
export function eServiceServiceBuilder(eserviceQuery: EserviceQuery) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceStatePayload,
    ): Promise<ApiUpdateEserviceStateResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.state = payload.eServiceState;

      logger.info("Updating eService State");
      await eserviceQuery.updateEserviceState(
        eserviceId,
        versionId,
        eServiceToBeUpdated,
      );
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceProbingStatePayload,
    ): Promise<ApiUpdateEserviceProbingStateResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.probingEnabled = payload.probingEnabled;

      logger.info("Updating eService Probing State");
      await eserviceQuery.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceToBeUpdated,
      );
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceFrequencyPayload,
    ): Promise<ApiUpdateEserviceFrequencyResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.pollingFrequency = payload.frequency;
      eServiceToBeUpdated.pollingStartTime = payload.startTime;
      eServiceToBeUpdated.pollingEndTime = payload.endTime;

      logger.info("Updating eService frequency");
      await eserviceQuery.updateEserviceFrequency(
        eserviceId,
        versionId,
        eServiceToBeUpdated,
      );
    },

    async saveEservice(
      eserviceId: string,
      versionId: string,
      payload: ApiSaveEservicePayload,
    ): Promise<ApiSaveEserviceResponse> {
      const eServiceToBeUpdated: EserviceSaveRequest = {
        state: payload.state,
        eserviceName: payload.name,
        producerName: payload.producerName,
        basePath: payload.basePath,
        technology: payload.technology,
        versionNumber: payload.versionNumber,
        audience: payload.audience,
      };

      logger.info("Save eService");
      return await eserviceQuery.saveEservice(
        eserviceId,
        versionId,
        eServiceToBeUpdated,
      );
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      payload: ApiUpdateLastRequestPayload,
    ): Promise<ApiUpdateLastRequestResponse> {
      const eServiceToBeUpdated: EserviceProbingUpdateLastRequest = {
        lastRequest: payload.lastRequest,
      };

      logger.info("Update eService probing last request");
      await eserviceQuery.updateEserviceLastRequest(
        eserviceRecordId,
        eServiceToBeUpdated,
      );
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      payload: ApiUpdateResponseReceivedPayload,
    ): Promise<ApiUpdateResponseReceivedResponse> {
      const eServiceToBeUpdated: ChangeResponseReceived = {
        responseStatus: payload.status,
        responseReceived: payload.responseReceived,
      };

      logger.info("Update eService probing response received");
      await eserviceQuery.updateResponseReceived(
        eserviceRecordId,
        eServiceToBeUpdated,
      );
    },

    async searchEservices(
      filters: ApiSearchEservicesQuery,
    ): Promise<ApiSearchEservicesResponse> {
      logger.info("Retrieving eServices");
      return await eserviceQuery.searchEservices(filters);
    },

    async getEserviceMainData(
      eserviceRecordId: number,
    ): Promise<ApiEserviceMainDataResponse> {
      logger.info("Retrieving eService main data");
      return await eserviceQuery.getEserviceMainData(eserviceRecordId);
    },

    async getEserviceProbingData(
      eserviceRecordId: number,
    ): Promise<ApiEserviceProbingDataResponse> {
      logger.info("Retrieving eService probing data");
      return await eserviceQuery.getEserviceProbingData(eserviceRecordId);
    },

    async getEservicesReadyForPolling(
      filters: ApiGetEservicesReadyForPollingQuery,
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
      logger.info("Retrieving eServices ready for polling");
      return await eserviceQuery.getEservicesReadyForPolling(filters);
    },

    async getEservicesProducers(
      filters: ApiGetProducersQuery,
    ): Promise<ApiGetProducersResponse> {
      logger.info("Retrieving eServices Producers");
      return await eserviceQuery.getEservicesProducers(filters);
    },
  };
}

export type EserviceService = ReturnType<typeof eServiceServiceBuilder>;
