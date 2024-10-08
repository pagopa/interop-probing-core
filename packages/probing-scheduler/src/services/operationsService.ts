import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiGetEservicesReadyForPollingHeaders,
  ApiGetEservicesReadyForPollingQuery,
  ApiGetEservicesReadyForPollingResponse,
  ApiUpdateLastRequestHeaders,
  ApiUpdateLastRequestParams,
  ApiUpdateLastRequestPayload,
  ApiUpdateLastRequestResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import {
  apiGetEservicesReadyForPollingError,
  apiUpdateLastRequestError,
} from "../model/domain/errors.js";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async getEservicesReadyForPolling(
      headers: ApiGetEservicesReadyForPollingHeaders,
      query: ApiGetEservicesReadyForPollingQuery,
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
      try {
        return await operationsApiClient.getEservicesReadyForPolling({
          queries: query,
          headers,
        });
      } catch (error: unknown) {
        throw apiGetEservicesReadyForPollingError(
          `Error API getEservicesReadyForPolling. Details: ${error}`,
          error,
        )
      }
    },
    async updateLastRequest(
      headers: ApiUpdateLastRequestHeaders,
      params: ApiUpdateLastRequestParams,
      payload: ApiUpdateLastRequestPayload,
    ): Promise<ApiUpdateLastRequestResponse> {
      try {
        return await operationsApiClient.updateLastRequest(payload, {
          params,
          headers,
        });
      } catch (error: unknown) {
        throw apiUpdateLastRequestError(
          `Error API updateLastRequest. Details: ${error}`,
          error,
        )
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
