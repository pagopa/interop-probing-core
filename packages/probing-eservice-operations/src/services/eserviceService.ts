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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-params
export function eServiceServiceBuilder(eserviceQuery: EserviceQuery) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceStatePayload,
      logger: Logger
    ): Promise<ApiUpdateEserviceStateResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.state = payload.eServiceState;

      logger.info(
        `Updating eService State with eserviceId: ${eserviceId}, versionId: ${versionId}`
      );
      await eserviceQuery.updateEserviceState(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceProbingStatePayload,
      logger: Logger
    ): Promise<ApiUpdateEserviceProbingStateResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.probingEnabled = payload.probingEnabled;

      logger.info(
        `Updating eService Probing State with eserviceId: ${eserviceId}, versionId: ${versionId}`
      );
      await eserviceQuery.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceFrequencyPayload,
      logger: Logger
    ): Promise<ApiUpdateEserviceFrequencyResponse> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.pollingFrequency = payload.frequency;
      eServiceToBeUpdated.pollingStartTime = payload.startTime;
      eServiceToBeUpdated.pollingEndTime = payload.endTime;

      logger.info(
        `Updating eService frequency with eserviceId: ${eserviceId}, versionId: ${versionId}`
      );
      await eserviceQuery.updateEserviceFrequency(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async saveEservice(
      eserviceId: string,
      versionId: string,
      payload: ApiSaveEservicePayload,
      logger: Logger
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

      logger.info(
        `Save eService with eserviceId: ${eserviceId}, versionId: ${versionId}`
      );
      return await eserviceQuery.saveEservice(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      payload: ApiUpdateLastRequestPayload,
      logger: Logger
    ): Promise<ApiUpdateLastRequestResponse> {
      const eServiceToBeUpdated: EserviceProbingUpdateLastRequest = {
        lastRequest: payload.lastRequest,
      };

      logger.info(
        `Update eService probing last request with eserviceRecordId: ${eserviceRecordId}`
      );
      await eserviceQuery.updateEserviceLastRequest(
        eserviceRecordId,
        eServiceToBeUpdated
      );
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      payload: ApiUpdateResponseReceivedPayload,
      logger: Logger
    ): Promise<ApiUpdateResponseReceivedResponse> {
      const eServiceToBeUpdated: ChangeResponseReceived = {
        responseStatus: payload.status,
        responseReceived: payload.responseReceived,
      };

      logger.info(
        `Update eService probing response received with eserviceRecordId: ${eserviceRecordId}`
      );
      await eserviceQuery.updateResponseReceived(
        eserviceRecordId,
        eServiceToBeUpdated
      );
    },

    async searchEservices(
      filters: ApiSearchEservicesQuery,
      logger: Logger
    ): Promise<ApiSearchEservicesResponse> {
      logger.info("Retrieving eServices");
      return await eserviceQuery.searchEservices(filters, logger);
    },

    async getEserviceMainData(
      eserviceRecordId: number,
      logger: Logger
    ): Promise<ApiEserviceMainDataResponse> {
      logger.info(
        `Retrieving eService main data with eserviceRecordId: ${eserviceRecordId}`
      );
      return await eserviceQuery.getEserviceMainData(eserviceRecordId, logger);
    },

    async getEserviceProbingData(
      eserviceRecordId: number,
      logger: Logger
    ): Promise<ApiEserviceProbingDataResponse> {
      logger.info(
        `Retrieving eService probing data with eserviceRecordId: ${eserviceRecordId}`
      );
      return await eserviceQuery.getEserviceProbingData(
        eserviceRecordId,
        logger
      );
    },

    async getEservicesReadyForPolling(
      filters: ApiGetEservicesReadyForPollingQuery,
      logger: Logger
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
      logger.debug("Retrieving eServices ready for polling");
      return await eserviceQuery.getEservicesReadyForPolling(filters, logger);
    },

    async getEservicesProducers(
      filters: ApiGetProducersQuery,
      logger: Logger
    ): Promise<ApiGetProducersResponse> {
      logger.info("Retrieving eServices Producers");
      return await eserviceQuery.getEservicesProducers(filters, logger);
    },
    //TODO: delete eservice
    async deleteEservice(
      eserviceId: string
    ): Promise<ApiDeleteEserviceResponse> {
      return await eserviceQuery.deleteEservice(eserviceId);
    },
  };
}

export type EserviceService = ReturnType<typeof eServiceServiceBuilder>;
