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
import { AppContext } from "pagopa-interop-probing-commons";
import { correlationIdToHeader } from "pagopa-interop-probing-models";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => ({
  async updateResponseReceived(
    eserviceRecordId: number,
    payload: ApiUpdateResponseReceivedPayload,
    ctx: AppContext,
  ): Promise<void> {
    await operationsApiClient.updateEserviceResponseReceived(
      {
        status: payload.status,
        responseReceived: payload.responseReceived,
      },
      {
        params: { eserviceRecordId },
        headers: correlationIdToHeader(ctx.correlationId),
      },
    );
  },

  async updateEserviceState(
    eserviceId: string,
    versionId: string,
    payload: ApiUpdateEserviceStatePayload,
    ctx: AppContext,
  ): Promise<void> {
    await operationsApiClient.updateEserviceState(
      {
        eServiceState: payload.eServiceState,
      },
      {
        params: { eserviceId, versionId },
        headers: correlationIdToHeader(ctx.correlationId),
      },
    );
  },

  async updateEserviceProbingState(
    eserviceId: string,
    versionId: string,
    payload: ApiUpdateEserviceProbingStatePayload,
    ctx: AppContext,
  ): Promise<void> {
    await operationsApiClient.updateEserviceProbingState(
      {
        probingEnabled: payload.probingEnabled,
      },
      {
        params: { eserviceId, versionId },
        headers: correlationIdToHeader(ctx.correlationId),
      },
    );
  },

  async updateEserviceFrequency(
    eserviceId: string,
    versionId: string,
    payload: ApiUpdateEserviceFrequencyPayload,
    ctx: AppContext,
  ): Promise<void> {
    await operationsApiClient.updateEserviceFrequency(
      {
        frequency: payload.frequency,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
      {
        params: { eserviceId, versionId },
        headers: correlationIdToHeader(ctx.correlationId),
      },
    );
  },

  async getEservices(
    filters: ApiSearchEservicesQuery,
    ctx: AppContext,
  ): Promise<ApiSearchEservicesResponse> {
    return await operationsApiClient.searchEservices({
      queries: {
        ...filters,
        ...{ versionNumber: Number(filters.versionNumber) || undefined },
      },
      headers: correlationIdToHeader(ctx.correlationId),
    });
  },

  async getEserviceMainData(
    eserviceRecordId: number,
    ctx: AppContext,
  ): Promise<ApiGetEserviceMainDataResponse> {
    return await operationsApiClient.getEserviceMainData({
      params: {
        eserviceRecordId,
      },
      headers: correlationIdToHeader(ctx.correlationId),
    });
  },

  async getEserviceProbingData(
    eserviceRecordId: number,
    ctx: AppContext,
  ): Promise<ApiGetEserviceProbingDataResponse> {
    return await operationsApiClient.getEserviceProbingData({
      params: {
        eserviceRecordId,
      },
      headers: correlationIdToHeader(ctx.correlationId),
    });
  },

  async getEservicesProducers(
    filters: ApiGetProducersQuery,
    ctx: AppContext,
  ): Promise<ApiGetProducersResponse> {
    return await operationsApiClient.getEservicesProducers({
      queries: filters,
      headers: correlationIdToHeader(ctx.correlationId),
    });
  },
});

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
