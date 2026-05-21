import { ZodiosInstance } from "@zodios/core";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import {
  apiGetEservicesReadyForPollingError,
  apiUpdateLastRequestError,
} from "../model/domain/errors.js";
import {
  WithSQSMessageId,
  AppContext,
  logger,
} from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<probingEserviceOperationsApi.EServiceApi>,
) => {
  return {
    async getEservicesReadyForPolling(
      headers: probingEserviceOperationsApi.ApiGetEservicesReadyForPollingHeaders,
      query: probingEserviceOperationsApi.ApiGetEservicesReadyForPollingQuery,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<probingEserviceOperationsApi.ApiGetEservicesReadyForPollingResponse> {
      try {
        logger(ctx).info(
          `Performing getEservicesReadyForPolling with query parameters limit ${query.limit} offset ${query.offset}`,
        );
        return await operationsApiClient.getEservicesReadyForPolling({
          queries: query,
          headers,
        });
      } catch (error: unknown) {
        throw apiGetEservicesReadyForPollingError(error);
      }
    },
    async updateLastRequest(
      headers: probingEserviceOperationsApi.ApiUpdateLastRequestHeaders,
      params: probingEserviceOperationsApi.ApiUpdateLastRequestParams,
      payload: probingEserviceOperationsApi.ApiUpdateLastRequestPayload,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<probingEserviceOperationsApi.ApiUpdateLastRequestResponse> {
      try {
        logger(ctx).info(
          `Performing updateLastRequest with eserviceRecordId ${params.eserviceRecordId}. Payload: ${JSON.stringify(payload)}`,
        );
        return await operationsApiClient.updateEserviceLastRequest(payload, {
          params,
          headers,
        });
      } catch (error: unknown) {
        throw apiUpdateLastRequestError(params.eserviceRecordId, error);
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
