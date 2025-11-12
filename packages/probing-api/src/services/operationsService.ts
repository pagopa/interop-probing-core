import { ZodiosInstance } from "@zodios/core";
import { AppContext, logger } from "pagopa-interop-probing-commons";
import {
  correlationIdToHeader,
  genericError,
} from "pagopa-interop-probing-models";
import {
  ProbingApiGetEserviceMainDataResponse,
  ProbingApiGetEserviceProbingDataResponse,
  ProbingApiGetProducersQuery,
  ProbingApiGetProducersResponse,
  ProbingApiSearchEservicesQuery,
  ProbingApiSearchEservicesResponse,
  ProbingApiUpdateEserviceFrequencyPayload,
  ProbingApiUpdateEserviceProbingStatePayload,
  ProbingApiUpdateEserviceStatePayload,
} from "../model/types.js";
import { Api } from "pagopa-interop-probing-eservice-operations-client";
import {
  fromECToMonitorState,
  fromEPDToMonitorState,
  isActive,
} from "../utilities/enumUtils.js";
import { z } from "zod";
import { ApiEServiceContent } from "../model/eservice.js";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => ({
  async updateEserviceState(
    eserviceId: string,
    versionId: string,
    payload: ProbingApiUpdateEserviceStatePayload,
    ctx: AppContext,
  ): Promise<void> {
    await operationsApiClient.updateEserviceState(
      { eServiceState: payload.eServiceState },
      {
        params: { eserviceId, versionId },
        headers: correlationIdToHeader(ctx.correlationId),
      },
    );
  },

  async updateEserviceProbingState(
    eserviceId: string,
    versionId: string,
    payload: ProbingApiUpdateEserviceProbingStatePayload,
    ctx: AppContext,
  ): Promise<void> {
    await operationsApiClient.updateEserviceProbingState(
      { probingEnabled: payload.probingEnabled },
      {
        params: { eserviceId, versionId },
        headers: correlationIdToHeader(ctx.correlationId),
      },
    );
  },

  async updateEserviceFrequency(
    eserviceId: string,
    versionId: string,
    payload: ProbingApiUpdateEserviceFrequencyPayload,
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
    filters: ProbingApiSearchEservicesQuery,
    ctx: AppContext,
  ): Promise<ProbingApiSearchEservicesResponse> {
    const eservices = await operationsApiClient.searchEservices({
      queries: {
        ...filters,
        versionNumber: Number(filters.versionNumber) || undefined,
      },
      headers: correlationIdToHeader(ctx.correlationId),
    });

    const mappedContent = eservices.content.map((el) => ({
      ...el,
      state: fromECToMonitorState(el),
    }));

    const result = z.array(ApiEServiceContent).safeParse(mappedContent);
    if (!result.success) {
      logger(ctx).error(
        `Unable to parse eServices items: result ${JSON.stringify(
          result,
        )} - data ${JSON.stringify(eservices.content)} `,
      );
      throw genericError("Unable to parse eServices items");
    }

    return {
      content: result.data,
      offset: eservices.offset,
      limit: eservices.limit,
      totalElements: eservices.totalElements,
    };
  },

  async getEserviceMainData(
    eserviceRecordId: number,
    ctx: AppContext,
  ): Promise<ProbingApiGetEserviceMainDataResponse> {
    return await operationsApiClient.getEserviceMainData({
      params: { eserviceRecordId },
      headers: correlationIdToHeader(ctx.correlationId),
    });
  },

  async getEserviceProbingData(
    eserviceRecordId: number,
    ctx: AppContext,
  ): Promise<ProbingApiGetEserviceProbingDataResponse> {
    const eServiceProbingData =
      await operationsApiClient.getEserviceProbingData({
        params: { eserviceRecordId },
        headers: correlationIdToHeader(ctx.correlationId),
      });

    return {
      probingEnabled: eServiceProbingData.probingEnabled,
      eserviceActive: isActive(eServiceProbingData.state),
      state: fromEPDToMonitorState(eServiceProbingData),
      ...(eServiceProbingData.responseReceived && {
        responseReceived: eServiceProbingData.responseReceived,
      }),
    };
  },

  async getEservicesProducers(
    filters: ProbingApiGetProducersQuery,
    ctx: AppContext,
  ): Promise<ProbingApiGetProducersResponse> {
    const producers = await operationsApiClient.getEservicesProducers({
      queries: filters,
      headers: correlationIdToHeader(ctx.correlationId),
    });

    return producers.content.map((el) => ({
      label: el,
      value: el,
    }));
  },
});

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
