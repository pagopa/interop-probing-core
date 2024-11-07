import {
  EService,
  ChangeEserviceProbingStateRequest,
  ChangeEserviceStateRequest,
  ChangeProbingFrequencyRequest,
  EserviceSaveRequest,
  EserviceProbingUpdateLastRequest,
  ChangeResponseReceived,
} from "pagopa-interop-probing-models";
import { ModelService } from "./dbService.js";
import {
  ApiGetEservicesReadyForPollingQuery,
  ApiGetProducersQuery,
  ApiSearchEservicesQuery,
  ApiGetEservicesReadyForPollingResponse,
  ApiSearchEservicesResponse,
  ApiGetProducersResponse,
  ApiEserviceMainDataResponse,
  ApiEserviceProbingDataResponse,
  ApiUpdateResponseReceivedResponse,
  ApiUpdateLastRequestResponse,
  ApiSaveEserviceResponse,
  ApiUpdateEserviceStateResponse,
  ApiUpdateEserviceProbingStateResponse,
  ApiUpdateEserviceFrequencyResponse,
  ApiDeleteEserviceResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { Logger } from "pagopa-interop-probing-commons";

export function eserviceQueryBuilder(modelService: ModelService) {
  return {
    updateEserviceState: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceStateRequest,
    ): Promise<ApiUpdateEserviceStateResponse> =>
      await modelService.updateEserviceState(
        eserviceId,
        versionId,
        eServiceUpdated,
      ),

    updateEserviceProbingState: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceProbingStateRequest,
    ): Promise<ApiUpdateEserviceProbingStateResponse> =>
      await modelService.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceUpdated,
      ),

    updateEserviceFrequency: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeProbingFrequencyRequest,
    ): Promise<ApiUpdateEserviceFrequencyResponse> =>
      await modelService.updateEserviceFrequency(
        eserviceId,
        versionId,
        eServiceUpdated,
      ),

    saveEservice: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: EserviceSaveRequest,
    ): Promise<ApiSaveEserviceResponse> =>
      await modelService.saveEservice(eserviceId, versionId, eServiceUpdated),

    deleteEservice: async (
      eserviceId: string,
    ): Promise<ApiDeleteEserviceResponse> =>
      await modelService.deleteEservice(eserviceId),

    updateEserviceLastRequest: async (
      eserviceRecordId: number,
      eServiceUpdated: EserviceProbingUpdateLastRequest,
    ): Promise<ApiUpdateLastRequestResponse> =>
      await modelService.updateEserviceLastRequest(
        eserviceRecordId,
        eServiceUpdated,
      ),

    updateResponseReceived: async (
      eserviceRecordId: number,
      eServiceUpdated: ChangeResponseReceived,
    ): Promise<ApiUpdateResponseReceivedResponse> =>
      await modelService.updateResponseReceived(
        eserviceRecordId,
        eServiceUpdated,
      ),

    getEServiceByIdAndVersion: async (
      eserviceId: string,
      versionId: string,
      logger: Logger,
    ): Promise<EService | undefined> =>
      await modelService.getEServiceByIdAndVersion(
        eserviceId,
        versionId,
        logger,
      ),

    searchEservices: async (
      filters: ApiSearchEservicesQuery,
      logger: Logger,
    ): Promise<ApiSearchEservicesResponse> =>
      await modelService.searchEservices(filters, logger),

    getEserviceMainData: async (
      eserviceRecordId: number,
      logger: Logger,
    ): Promise<ApiEserviceMainDataResponse> =>
      await modelService.getEserviceMainData(eserviceRecordId, logger),

    getEserviceProbingData: async (
      eserviceRecordId: number,
      logger: Logger,
    ): Promise<ApiEserviceProbingDataResponse> =>
      await modelService.getEserviceProbingData(eserviceRecordId, logger),

    getEservicesProducers: async (
      filters: ApiGetProducersQuery,
      logger: Logger,
    ): Promise<ApiGetProducersResponse> =>
      await modelService.getEservicesProducers(filters, logger),

    getEservicesReadyForPolling: async (
      filters: ApiGetEservicesReadyForPollingQuery,
      logger: Logger,
    ): Promise<ApiGetEservicesReadyForPollingResponse> =>
      await modelService.getEservicesReadyForPolling(filters, logger),
  };
}

export type EserviceQuery = ReturnType<typeof eserviceQueryBuilder>;
