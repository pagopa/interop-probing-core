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
  ApiGetEserviceMainDataResponse,
  ApiGetEserviceProbingDataResponse,
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
import {
  eServiceByRecordIdNotFound,
  eServiceByVersionIdNotFound,
  eServiceNotFound,
} from "../model/domain/errors.js";
import { DBService } from "./dbService.js";
import { z } from "zod";
import { safeStringify } from "../utilities/utils.js";

export function eServiceServiceBuilder(dbService: DBService) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceStatePayload,
    ): Promise<ApiUpdateEserviceStateResponse> {
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
      payload: ApiUpdateEserviceProbingStatePayload,
    ): Promise<ApiUpdateEserviceProbingStateResponse> {
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
      payload: ApiUpdateEserviceFrequencyPayload,
    ): Promise<ApiUpdateEserviceFrequencyResponse> {
      const eServiceToBeUpdated = await dbService.getEserviceByIdAndVersion(
        eserviceId,
        versionId,
      );

      if (!eServiceToBeUpdated) {
        throw eServiceByVersionIdNotFound(eserviceId, versionId);
      }

      if (
        typeof payload?.frequency === "number" &&
        !isNaN(payload?.frequency)
      ) {
        await dbService.updateEserviceFrequency(eserviceId, versionId, {
          pollingStartTime: payload.startTime,
          pollingEndTime: payload.endTime,
          pollingFrequency: payload.frequency,
        });
      }
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

      await dbService.saveEservice(eserviceId, versionId, eServiceToBeUpdated);
    },

    async deleteEservice(
      eserviceId: string,
    ): Promise<ApiDeleteEserviceResponse> {
      const eServices = await dbService.getEservicesById(eserviceId);
      if (eServices.length === 0) {
        throw eServiceNotFound(eserviceId);
      }

      await dbService.deleteEservice(eserviceId);
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      payload: ApiUpdateLastRequestPayload,
    ): Promise<ApiUpdateLastRequestResponse> {
      const eService = await dbService.getEserviceByRecordId(eserviceRecordId);

      if (!eService) throw eServiceByRecordIdNotFound(eserviceRecordId);

      await dbService.updateEserviceLastRequest(eserviceRecordId, {
        lastRequest: payload.lastRequest,
      });
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      payload: ApiUpdateResponseReceivedPayload,
    ): Promise<ApiUpdateResponseReceivedResponse> {
      const eService = await dbService.getEserviceByRecordId(eserviceRecordId);

      if (!eService) throw eServiceByRecordIdNotFound(eserviceRecordId);

      await dbService.updateResponseReceived(eserviceRecordId, {
        status: payload.status,
        responseReceived: payload.responseReceived,
      });
    },

    async searchEservices(
      filters: ApiSearchEservicesQuery,
      logger: Logger,
    ): Promise<ApiSearchEservicesResponse> {
      const result = await dbService.searchEservices(filters);

      const mappedContent = result.content.map((el) => ({
        ...el,
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
    ): Promise<ApiGetEserviceMainDataResponse> {
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
    ): Promise<ApiGetEserviceProbingDataResponse> {
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
      filters: ApiGetEservicesReadyForPollingQuery,
      logger: Logger,
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
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
      filters: ApiGetProducersQuery,
    ): Promise<ApiGetProducersResponse> {
      const result = await dbService.getEservicesProducers(filters);
      return {
        content: result.content.map((el) => el.producerName),
      };
    },
  };
}

export type EserviceService = ReturnType<typeof eServiceServiceBuilder>;
