import { logger } from "pagopa-interop-probing-commons";
import {
  ChangeResponseReceived,
  EServiceContent,
  EserviceProbingUpdateLastRequest,
  EserviceSaveRequest,
  ListResult,
} from "pagopa-interop-probing-models";
import {
  EServiceQueryFilters,
  EServiceProducersQueryFilters,
} from "./readmodel/readModelService.js";
import { EserviceQuery } from "./readmodel/eserviceQuery.js";
import {
  ApiSaveEservicePayload,
  ApiUpdateEserviceFrequencyPayload,
  ApiUpdateEserviceProbingStatePayload,
  ApiUpdateEserviceStatePayload,
  ApiUpdateLastRequestPayload,
  ApiUpdateResponseReceivedPayload,
} from "../model/types.js";
import { eServiceNotFound } from "../model/domain/errors.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-params
export function eServiceServiceBuilder(eserviceQuery: EserviceQuery) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceStatePayload
    ): Promise<void> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.state = payload.eServiceState;

      logger.info("Updating eService State");
      await eserviceQuery.updateEserviceState(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceProbingStatePayload
    ): Promise<void> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.probingEnabled = payload.probingEnabled;

      logger.info("Updating eService Probing State");
      await eserviceQuery.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceFrequencyPayload
    ): Promise<void> {
      const eServiceToBeUpdated = await eserviceQuery.getEServiceByIdAndVersion(
        eserviceId,
        versionId
      );

      if (!eServiceToBeUpdated) {
        throw eServiceNotFound(eserviceId, versionId);
      }

      eServiceToBeUpdated.pollingFrequency = payload.frequency;
      eServiceToBeUpdated.pollingStartTime = payload.startTime;
      eServiceToBeUpdated.pollingEndTime = payload.endTime;

      logger.info("Updating eService frequency");
      await eserviceQuery.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async saveEservice(
      eserviceId: string,
      versionId: string,
      payload: ApiSaveEservicePayload
    ): Promise<void> {
      const eServiceToBeUpdated =
        (await eserviceQuery.getEServiceByIdAndVersion(
          eserviceId,
          versionId
        )) || <EserviceSaveRequest>{};

      eServiceToBeUpdated.eserviceName = payload.name;
      eServiceToBeUpdated.producerName = payload.producerName;
      eServiceToBeUpdated.basePath = payload.basePath;
      eServiceToBeUpdated.technology = payload.technology;
      eServiceToBeUpdated.versionNumber = payload.versionNumber;
      eServiceToBeUpdated.audience = payload.audience;

      logger.info("Save eService");
      await eserviceQuery.saveEservice(
        eserviceId,
        versionId,
        eServiceToBeUpdated
      );
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      payload: ApiUpdateLastRequestPayload
    ): Promise<void> {
      const eServiceToBeUpdated: EserviceProbingUpdateLastRequest = {
        lastRequest: payload.lastRequest
      }

      logger.info("Update eService probing last request");
      await eserviceQuery.updateEserviceLastRequest(
        eserviceRecordId,
        eServiceToBeUpdated
      );
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      payload: ApiUpdateResponseReceivedPayload
    ): Promise<void> {
      const eServiceToBeUpdated: ChangeResponseReceived = {
        responseStatus: payload.status,
        responseReceived: payload.responseReceived
      }

      logger.info("Update eService probing response received");
      await eserviceQuery.updateResponseReceived(
        eserviceRecordId,
        eServiceToBeUpdated
      );
    },

    async getEservices(
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContent>> {
      logger.info("Retrieving eServices");
      return await eserviceQuery.getEservices(filters, limit, offset);
    },

    async getEservicesReadyForPolling(
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContent>> {
      logger.info("Retrieving eServices ready for polling");
      return await eserviceQuery.getEservicesReadyForPolling(limit, offset);
    },

    async getEservicesProducers(
      filters: EServiceProducersQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<string>> {
      logger.info("Retrieving eServices Producers");
      return await eserviceQuery.getEservicesProducers(filters, limit, offset);
    },
  };
}
