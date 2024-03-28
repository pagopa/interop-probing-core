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
} from "pagopa-interop-probing-eservice-operations-client";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    ): Promise<EService | undefined> =>
      await modelService.getEServiceByIdAndVersion(eserviceId, versionId),
    searchEservices: async (
      filters: ApiSearchEservicesQuery,
    ): Promise<ApiSearchEservicesResponse> =>
      await modelService.searchEservices(filters),
    getEserviceMainData: async (
      eserviceRecordId: number,
    ): Promise<ApiEserviceMainDataResponse> =>
      await modelService.getEserviceMainData(eserviceRecordId),
    getEserviceProbingData: async (
      eserviceRecordId: number,
    ): Promise<ApiEserviceProbingDataResponse> =>
      await modelService.getEserviceProbingData(eserviceRecordId),
    getEservicesProducers: async (
      filters: ApiGetProducersQuery,
    ): Promise<ApiGetProducersResponse> =>
      await modelService.getEservicesProducers(filters),
    getEservicesReadyForPolling: async (
      filters: ApiGetEservicesReadyForPollingQuery,
    ): Promise<ApiGetEservicesReadyForPollingResponse> =>
      await modelService.getEservicesReadyForPolling(filters),
  };
}

export type EserviceQuery = ReturnType<typeof eserviceQueryBuilder>;
