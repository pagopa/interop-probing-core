import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiGetEservicesReadyForPollingQuery,
  ApiGetEservicesReadyForPollingResponse,
  ApiUpdateLastRequestParams,
  ApiUpdateLastRequestPayload,
  ApiUpdateLastRequestResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import {
  apiGetEservicesReadyForPollingError,
  apiUpdateLastRequestError,
  makeApplicationError,
} from "../model/domain/errors.js";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async getEservicesReadyForPolling(
      query: ApiGetEservicesReadyForPollingQuery,
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
      try {
        return await operationsApiClient.getEservicesReadyForPolling({
          queries: query,
        });
      } catch (error: unknown) {
        throw makeApplicationError(
          apiGetEservicesReadyForPollingError(
            `Error API getEservicesReadyForPolling. Details: ${error}`,
            error,
          ),
        );
      }
    },
    async updateLastRequest({
      params,
      payload,
    }: {
      params: ApiUpdateLastRequestParams;
      payload: ApiUpdateLastRequestPayload;
    }): Promise<ApiUpdateLastRequestResponse> {
      try {
        return await operationsApiClient.updateLastRequest(payload, { params });
      } catch (error: unknown) {
        throw makeApplicationError(
          apiUpdateLastRequestError(
            `Error API updateLastRequest. Details: ${error}`,
            error,
          ),
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
