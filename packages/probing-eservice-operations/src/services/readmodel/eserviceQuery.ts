import { EService, ListResult } from "pagopa-interop-probing-models";
import {
  ReadModelService,
  EServiceQueryFilters,
  EServiceProducersQueryFilters,
} from "./readModelService.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function eserviceQueryBuilder(readModelService: ReadModelService) {
  return {
    getEservices: async (
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EService>> =>
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
    ): Promise<ListResult<EService>> =>
      await readModelService.getEservicesReadyForPolling(limit, offset),
  };
}

export type EserviceQuery = ReturnType<typeof eserviceQueryBuilder>;
