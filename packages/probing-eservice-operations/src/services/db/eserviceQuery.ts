import {
  EService,
  ChangeEserviceProbingStateRequest,
  ChangeEserviceStateRequest,
  EServiceContent,
  ChangeProbingFrequencyRequest,
  EserviceSaveRequest,
  EserviceProbingUpdateLastRequest,
  ChangeResponseReceived,
  EServiceMainData,
  EServiceProbingData,
  PollingResource,
  EServiceQueryFilters,
  EServiceProducersQueryFilters,
} from "pagopa-interop-probing-models";
import {
  ModelService,
} from "./dbService.js";
import { ListResult } from "../../model/dbModels.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function eserviceQueryBuilder(modelService: ModelService) {
  return {
    updateEserviceState: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceStateRequest
    ): Promise<void> =>
      await modelService.updateEserviceState(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    updateEserviceProbingState: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceProbingStateRequest
    ): Promise<void> =>
      await modelService.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    updateEserviceFrequency: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeProbingFrequencyRequest
    ): Promise<void> =>
      await modelService.updateEserviceFrequency(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    saveEservice: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: EserviceSaveRequest
    ): Promise<void> =>
      await modelService.saveEservice(eserviceId, versionId, eServiceUpdated),
    updateEserviceLastRequest: async (
      eserviceRecordId: number,
      eServiceUpdated: EserviceProbingUpdateLastRequest
    ): Promise<void> =>
      await modelService.updateEserviceLastRequest(
        eserviceRecordId,
        eServiceUpdated
      ),
    updateResponseReceived: async (
      eserviceRecordId: number,
      eServiceUpdated: ChangeResponseReceived
    ): Promise<void> =>
      await modelService.updateResponseReceived(
        eserviceRecordId,
        eServiceUpdated
      ),
    getEServiceByIdAndVersion: async (
      eserviceId: string,
      versionId: string
    ): Promise<EService | undefined> =>
      await modelService.getEServiceByIdAndVersion(eserviceId, versionId),
    searchEservices: async (
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContent>> =>
      await modelService.searchEservices(filters, limit, offset),
    getEserviceMainData: async (
      eserviceRecordId: number
    ): Promise<EServiceMainData> =>
      await modelService.getEserviceMainData(eserviceRecordId),
    getEserviceProbingData: async (
      eserviceRecordId: number
    ): Promise<EServiceProbingData> =>
      await modelService.getEserviceProbingData(eserviceRecordId),
    getEservicesProducers: async (
      filters: EServiceProducersQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<string>> =>
      await modelService.getEservicesProducers(filters, limit, offset),
    getEservicesReadyForPolling: async (
      limit: number,
      offset: number
    ): Promise<ListResult<PollingResource>> =>
      await modelService.getEservicesReadyForPolling(limit, offset),
  };
}

export type EserviceQuery = ReturnType<typeof eserviceQueryBuilder>;
