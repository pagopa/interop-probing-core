import {
  EService,
  ChangeEserviceProbingStateRequest,
  ListResult,
  ChangeEserviceStateRequest,
  EServiceContent,
  ChangeProbingFrequencyRequest,
  EserviceSaveRequest,
  EserviceProbingUpdateLastRequest,
  ChangeResponseReceived,
} from "pagopa-interop-probing-models";
import {
  ReadModelService,
  EServiceQueryFilters,
  EServiceProducersQueryFilters,
} from "./readModelService.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function eserviceQueryBuilder(readModelService: ReadModelService) {
  return {
    updateEserviceState: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceStateRequest
    ): Promise<void> =>
      await readModelService.updateEserviceState(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    updateEserviceProbingState: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceProbingStateRequest
    ): Promise<void> =>
      await readModelService.updateEserviceProbingState(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    updateEserviceFrequency: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeProbingFrequencyRequest
    ): Promise<void> =>
      await readModelService.updateEserviceFrequency(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    saveEservice: async (
      eserviceId: string,
      versionId: string,
      eServiceUpdated: EserviceSaveRequest
    ): Promise<void> =>
      await readModelService.saveEservice(
        eserviceId,
        versionId,
        eServiceUpdated
      ),
    updateEserviceLastRequest: async (
      eserviceRecordId: number,
      eServiceUpdated: EserviceProbingUpdateLastRequest
    ): Promise<void> =>
      await readModelService.updateEserviceLastRequest(
        eserviceRecordId,
        eServiceUpdated
      ),
    updateResponseReceived: async (
      eserviceRecordId: number,
      eServiceUpdated: ChangeResponseReceived
    ): Promise<void> =>
      await readModelService.updateResponseReceived(
        eserviceRecordId,
        eServiceUpdated
      ),
    getEServiceByIdAndVersion: async (
      eserviceId: string,
      versionId: string
    ): Promise<EService | undefined> =>
      await readModelService.getEServiceByIdAndVersion(eserviceId, versionId),
    getEservices: async (
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContent>> =>
      await readModelService.getEservices(filters, limit, offset),
    getEservicesProducers: async (
      filters: EServiceProducersQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<string>> =>
      await readModelService.getEservicesProducers(filters, limit, offset),
    getEservicesReadyForPolling: async (
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContent>> =>
      await readModelService.getEservicesReadyForPolling(limit, offset),
  };
}

export type EserviceQuery = ReturnType<typeof eserviceQueryBuilder>;
