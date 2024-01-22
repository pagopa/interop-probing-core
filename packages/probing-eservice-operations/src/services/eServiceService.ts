import { logger } from "pagopa-interop-probing-commons";
import { EService, ListResult } from "pagopa-interop-probing-models";
import { EServiceQueryFilters, EServiceProducersQueryFilters } from "./readmodel/readModelService.js";
import { EserviceQuery } from "./readmodel/eserviceQuery.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-params
export function eServiceServiceBuilder(
  eserviceQuery: EserviceQuery
) {
  return {
    async getEservices(
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EService>> {
      logger.info("Retrieving eServices");
      return await eserviceQuery.getEservices(filters, limit, offset);
    },
    async getEservicesProducers(
      filters: EServiceProducersQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<string>> {
      logger.info("Retrieving eServicesProducers");
      return await eserviceQuery.getEservicesProducers(filters, limit, offset);
    },
  };
}
