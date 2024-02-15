import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiUpdateEserviceFrequencyPayload,
  ApiUpdateEserviceProbingStatePayload,
  ApiUpdateEserviceStatePayload,
  ApiUpdateResponseReceivedPayload,
} from "../../../probing-eservice-operations/src/model/types.js";
import {
  EServiceProbingData,
  EServiceProducersQueryFilters,
  EServiceQueryFilters,
} from "pagopa-interop-probing-models";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceProbingDataByRecordIdNotFound,
} from "../model/domain/errors.js";
import {
  ApiGetEserviceMainDataResponse,
  ApiGetEserviceProbingDataResponse,
  ApiGetEservicesResponse,
  ApiGetProducersResponse,
} from "../model/types.js";
import { fromPdndToMonitorState, isActive } from "../utilities/enumUtils.js";
import { z } from "zod";

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
      const { totalElements = 0 , content = [] } =
        await operationsApiClient.searchEservices({
          queries: {
            limit,
            offset,
            ...filters,
          },
        });

      

      const result = z
        .array(EServiceProbingData)
        .safeParse((data.content || []).map((d) => d));

      const result_content = result.map((el) => ({ ...el, state: fromPdndToMonitorState(el.state) }));

      return {
        content,
        offset,
        limit,
        totalElements,
      };
    },

    async getEserviceMainData(
      eserviceRecordId: number
    ): Promise<ApiGetEserviceMainDataResponse> {
      const data = await operationsApiClient.getEserviceMainData({
        params: {
          eserviceRecordId,
        },
      });

      if (!data) {
        throw eServiceMainDataByRecordIdNotFound(eserviceRecordId);
      }

      return data;
    },

    async getEserviceProbingData(
      eserviceRecordId: number
    ): Promise<ApiGetEserviceProbingDataResponse> {
      const data = await operationsApiClient.getEserviceProbingData({
        params: {
          eserviceRecordId,
        },
      });

      if (!data) {
        throw eServiceProbingDataByRecordIdNotFound(eserviceRecordId);
      }

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
