import { Logger } from "pagopa-interop-probing-commons";
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
  ApiDeleteEserviceResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { eServiceNotFound } from "../model/domain/errors.js";

export function eServiceServiceBuilder(eserviceQuery: EserviceQuery) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceStatePayload,
      logger: Logger,
    ): Promise<ApiUpdateEserviceStateResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.state = payload.eServiceState;

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
      logger: Logger,
    ): Promise<ApiUpdateEserviceProbingStateResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.probingEnabled = payload.probingEnabled;

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
      logger: Logger,
    ): Promise<ApiUpdateEserviceFrequencyResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.pollingFrequency = payload.frequency;
      eServiceToBeUpdated.pollingStartTime = payload.startTime;
      eServiceToBeUpdated.pollingEndTime = payload.endTime;

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
        producerId: payload.producerId,
        basePath: payload.basePath,
        technology: payload.technology,
        versionNumber: payload.versionNumber,
        audience: payload.audience,
      };

      return await eserviceQuery.saveEservice(
        eserviceId,
        versionId,
        eServiceToBeUpdated,
      );
    },

    async deleteEservice(
      eserviceId: string,
    ): Promise<ApiDeleteEserviceResponse> {
      return await eserviceQuery.deleteEservice(eserviceId);
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      payload: ApiUpdateLastRequestPayload,
    ): Promise<ApiUpdateLastRequestResponse> {
      const eServiceToBeUpdated: EserviceProbingUpdateLastRequest = {
        lastRequest: payload.lastRequest,
      };

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
      await eserviceQuery.updateResponseReceived(
        eserviceRecordId,
        eServiceToBeUpdated,
      );
    },

    async searchEservices(
      filters: ApiSearchEservicesQuery,
      logger: Logger,
    ): Promise<ApiSearchEservicesResponse> {
      return await eserviceQuery.searchEservices(filters, logger);
    },

    async getEserviceMainData(
      eserviceRecordId: number,
      logger: Logger,
    ): Promise<ApiEserviceMainDataResponse> {
      return await eserviceQuery.getEserviceMainData(eserviceRecordId, logger);
    },

    async getEserviceProbingData(
      eserviceRecordId: number,
      logger: Logger,
    ): Promise<ApiEserviceProbingDataResponse> {
      return await eserviceQuery.getEserviceProbingData(
        eserviceRecordId,
        logger,
      );
    },

    async getEservicesReadyForPolling(
      filters: ApiGetEservicesReadyForPollingQuery,
      logger: Logger,
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
      return await eserviceQuery.getEservicesReadyForPolling(filters, logger);
    },

    async getEservicesProducers(
      filters: ApiGetProducersQuery,
      logger: Logger,
    ): Promise<ApiGetProducersResponse> {
      return await eserviceQuery.getEservicesProducers(filters, logger);
    },
  };
}

export type EserviceService = ReturnType<typeof eServiceServiceBuilder>;
