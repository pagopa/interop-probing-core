import { Logger } from "pagopa-interop-probing-commons";
import {
  EServiceContent,
  EServiceMainData,
  EServiceProbingData,
  EserviceSaveRequest,
  genericError,
  PollingResource,
} from "pagopa-interop-probing-models";
import {
  eServiceByRecordIdNotFound,
  eServiceByVersionIdNotFound,
} from "../model/domain/errors.js";
import { DBService } from "./dbService.js";
import { z } from "zod";
import { safeStringify } from "../utilities/utils.js";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";

export function eServiceServiceBuilder(dbService: DBService) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: probingEserviceOperationsApi.ApiUpdateEserviceStatePayload,
    ): Promise<probingEserviceOperationsApi.ApiUpdateEserviceStateResponse> {
      const eServiceToBeUpdated = await dbService.getEserviceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceByVersionIdNotFound(eserviceId, versionId);
      }

      await dbService.updateEserviceState(eserviceId, versionId, {
        state: payload.eServiceState,
      });
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      payload: probingEserviceOperationsApi.ApiUpdateEserviceProbingStatePayload,
    ): Promise<probingEserviceOperationsApi.ApiUpdateEserviceProbingStateResponse> {
      const eServiceToBeUpdated = await dbService.getEserviceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceByVersionIdNotFound(eserviceId, versionId);
      }

      await dbService.updateEserviceProbingState(eserviceId, versionId, {
        probingEnabled: payload.probingEnabled,
      });
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      payload: probingEserviceOperationsApi.ApiUpdateEserviceFrequencyPayload,
    ): Promise<probingEserviceOperationsApi.ApiUpdateEserviceFrequencyResponse> {
      const eServiceToBeUpdated = await dbService.getEserviceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceByVersionIdNotFound(eserviceId, versionId);
      }

      await dbService.updateEserviceFrequency(eserviceId, versionId, {
        pollingStartTime: payload.startTime,
        pollingEndTime: payload.endTime,
        pollingFrequency: payload.frequency,
      });
    },

    async saveEservice(
      eserviceId: string,
      versionId: string,
      payload: probingEserviceOperationsApi.ApiSaveEservicePayload,
    ): Promise<probingEserviceOperationsApi.ApiSaveEserviceResponse> {
      const eServiceToBeUpdated: EserviceSaveRequest = {
        state: payload.state,
        eserviceName: payload.name,
        producerId: payload.producerId,
        basePath: payload.basePath,
        technology: payload.technology,
        versionNumber: payload.versionNumber,
        audience: payload.audience,
      };

      await dbService.saveEservice(eserviceId, versionId, eServiceToBeUpdated);
    },

    async deleteEservice(
      eserviceId: string,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiDeleteEserviceResponse> {
      const eService = await dbService.getEserviceById(eserviceId);
      if (!eService) {
        logger.error(
          `EService with eserviceId ${eserviceId} not found while performing the delete operation. Operation skipped.`,
        );
        return;
      }

      await dbService.deleteEservice(eserviceId);
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      payload: probingEserviceOperationsApi.ApiUpdateLastRequestPayload,
    ): Promise<probingEserviceOperationsApi.ApiUpdateLastRequestResponse> {
      const eService = await dbService.getEserviceByRecordId(eserviceRecordId);

      if (!eService) throw eServiceByRecordIdNotFound(eserviceRecordId);

      await dbService.updateEserviceLastRequest(eserviceRecordId, {
        lastRequest: payload.lastRequest,
      });
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      payload: probingEserviceOperationsApi.ApiUpdateResponseReceivedPayload,
    ): Promise<probingEserviceOperationsApi.ApiUpdateResponseReceivedResponse> {
      const eService = await dbService.getEserviceByRecordId(eserviceRecordId);

      if (!eService) throw eServiceByRecordIdNotFound(eserviceRecordId);

      await dbService.updateResponseReceived(eserviceRecordId, {
        status: payload.status,
        responseReceived: payload.responseReceived,
      });
    },

    async searchEservices(
      filters: probingEserviceOperationsApi.ApiSearchEservicesQuery,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiSearchEservicesResponse> {
      const result = await dbService.searchEservices(filters);

      const mappedContent = result.content.map((el) => ({
        ...el,
        responseStatus: el.status,
        eserviceRecordId: String(el.id),
        technology: el.eserviceTechnology,
      }));

      const parsed = z.array(EServiceContent).safeParse(mappedContent);
      if (!parsed.success) {
        logger.error(
          `Unable to parse eservices items: parsed ${safeStringify(parsed)} - data ${safeStringify(mappedContent)} `,
        );
        throw genericError("Unable to parse eservices items");
      }

      return {
        content: parsed.data,
        limit: result.limit,
        offset: result.offset,
        totalElements: result.totalElements,
      };
    },

    async getEserviceMainData(
      eserviceRecordId: number,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiGetEserviceMainDataResponse> {
      const result = await dbService.getEserviceMainData(eserviceRecordId);
      if (!result) throw eServiceByRecordIdNotFound(eserviceRecordId);

      const parsed = EServiceMainData.safeParse(result);
      if (!parsed.success) {
        logger.error(
          `Unable to parse eservice mainData item: parsed ${safeStringify(parsed)} - data ${safeStringify(
            result,
          )} `,
        );
        throw genericError("Unable to parse eservice mainData item");
      }

      return parsed.data;
    },

    async getEserviceProbingData(
      eserviceRecordId: number,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiGetEserviceProbingDataResponse> {
      const result = await dbService.getEserviceProbingData(eserviceRecordId);

      if (!result) throw eServiceByRecordIdNotFound(eserviceRecordId);

      const parsed = EServiceProbingData.safeParse({
        ...result,
        responseStatus: result.status,
      });
      if (!parsed.success) {
        logger.error(
          `Unable to parse eservice probingData item: parsed ${safeStringify(parsed)} - data ${safeStringify(
            result,
          )} `,
        );
        throw genericError("Unable to parse eservice probingData item");
      }

      return parsed.data;
    },

    async getEservicesReadyForPolling(
      filters: probingEserviceOperationsApi.ApiGetEservicesReadyForPollingQuery,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiGetEservicesReadyForPollingResponse> {
      const result = await dbService.getEservicesReadyForPolling(filters);

      const mappedContent = result.content.map((el) => ({
        ...el,
        eserviceRecordId: String(el.id),
        technology: el.eserviceTechnology,
      }));

      const parsed = z.array(PollingResource).safeParse(mappedContent);
      if (!parsed.success) {
        logger.error(
          `Unable to parse eservices ready for polling items: parsed ${safeStringify(parsed)} - data ${safeStringify(mappedContent)} `,
        );
        throw genericError("Unable to parse eservices ready for polling items");
      }

      return {
        content: parsed.data,
        totalElements: result.totalElements,
      };
    },

    async getEservicesProducers(
      filters: probingEserviceOperationsApi.ApiGetProducersQuery,
    ): Promise<probingEserviceOperationsApi.ApiGetProducersResponse> {
      const result = await dbService.getEservicesProducers(filters);
      return {
        content: result.content.map((el) => el.producerName),
      };
    },
  };
}

export type EserviceService = ReturnType<typeof eServiceServiceBuilder>;
