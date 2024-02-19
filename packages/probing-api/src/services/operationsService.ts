import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiUpdateEserviceFrequencyPayload,
  ApiUpdateEserviceProbingStatePayload,
  ApiUpdateEserviceStatePayload,
  ApiUpdateResponseReceivedPayload,
} from "../../../probing-eservice-operations/src/model/types.js";
import {
  ApiEServiceContent,
  EServiceProducersQueryFilters,
  EServiceQueryFilters,
} from "pagopa-interop-probing-models";
import {
  ApiGetEserviceMainDataResponse,
  ApiGetEserviceProbingDataResponse,
  ApiGetEservicesResponse,
  ApiGetProducersResponse,
} from "../model/types.js";
import { fromPdndToMonitorState, isActive } from "../utilities/enumUtils.js";
import { z } from "zod";
import { logger } from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>
) => {
  return {
    async updateResponseReceived(
      eserviceRecordId: number,
      payload: ApiUpdateResponseReceivedPayload
    ): Promise<void> {
      await operationsApiClient.updateResponseReceived(
        {
          status: payload.status,
          responseReceived: payload.responseReceived,
        },
        { params: { eserviceRecordId } }
      );
    },

    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceStatePayload
    ): Promise<void> {
      await operationsApiClient.updateEserviceState(
        {
          eServiceState: payload.eServiceState,
        },
        { params: { eserviceId, versionId } }
      );
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceProbingStatePayload
    ): Promise<void> {
      await operationsApiClient.updateEserviceProbingState(
        {
          probingEnabled: payload.probingEnabled,
        },
        { params: { eserviceId, versionId } }
      );
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      payload: ApiUpdateEserviceFrequencyPayload
    ): Promise<void> {
      await operationsApiClient.updateEserviceFrequency(
        {
          frequency: payload.frequency,
          startTime: payload.startTime,
          endTime: payload.endTime,
        },
        { params: { eserviceId, versionId } }
      );
    },

    async getEservices(
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ApiGetEservicesResponse> {
      const data = await operationsApiClient.searchEservices({
        queries: {
          limit,
          offset,
          ...filters,
        },
      });

      const content = [];
      const result = z.array(ApiEServiceContent).safeParse(
        data.content.map((d) => ({
          eserviceRecordId: d.eserviceRecordId,
          eserviceName: d.eserviceName,
          producerName: d.producerName,
          responseReceived: d.responseReceived,
          state: fromPdndToMonitorState,
          versionNumber: d.versionNumber,
        }))
      );

      if (!result.success) {
        logger.error(
          `Unable to parse eservices items: result ${JSON.stringify(
            result
          )} - data ${JSON.stringify(data.content)} `
        );
      } else {
        content.push(...result.data)
      }

      return {
        content,
        offset,
        limit,
        totalElements: data.totalElements,
      };
    },

    async getEserviceMainData(
      eserviceRecordId: number
    ): Promise<ApiGetEserviceMainDataResponse> {
      return await operationsApiClient.getEserviceMainData({
        params: {
          eserviceRecordId,
        },
      });
    },

    async getEserviceProbingData(
      eserviceRecordId: number
    ): Promise<ApiGetEserviceProbingDataResponse> {
      const data = await operationsApiClient.getEserviceProbingData({
        params: {
          eserviceRecordId,
        },
      });

      return {
        probingEnabled: data.probingEnabled,
        eserviceActive: isActive(data.state),
        state: fromPdndToMonitorState(data),
        ...(data.responseReceived && {
          responseReceived: data.responseReceived,
        }),
      };
    },

    async getEservicesProducers(
      filters: EServiceProducersQueryFilters,
      limit: number,
      offset: number
    ): Promise<ApiGetProducersResponse> {
      const { content = [] } = await operationsApiClient.getEservicesProducers({
        queries: {
          limit,
          offset,
          ...filters,
        },
      });

      return content.map((el) => ({ label: el, value: el }));
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
