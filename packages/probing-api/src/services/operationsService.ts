import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiUpdateEserviceFrequencyPayload,
  ApiUpdateEserviceProbingStatePayload,
  ApiUpdateEserviceStatePayload,
  ApiUpdateResponseReceivedPayload,
  ApiGetProducersResponse,
  ApiGetEserviceProbingDataResponse,
  ApiGetEserviceMainDataResponse,
  ApiSearchEservicesResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import {
  ApiGetProducersQuery,
  ApiSearchEservicesQuery,
} from "../model/types.js";

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
      filters: ApiSearchEservicesQuery
    ): Promise<ApiSearchEservicesResponse> {
      return await operationsApiClient.searchEservices({
        queries: {
          ...filters,
          ...{ versionNumber: Number(filters.versionNumber) || undefined },
        },
      });
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
      return await operationsApiClient.getEserviceProbingData({
        params: {
          eserviceRecordId,
        },
      });
    },

    async getEservicesProducers(
      filters: ApiGetProducersQuery
    ): Promise<ApiGetProducersResponse> {
      return await operationsApiClient.getEservicesProducers({
        queries: filters,
      });
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
