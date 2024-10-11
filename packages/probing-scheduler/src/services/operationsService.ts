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
  makeApplicationError,
} from "../model/domain/errors.js";
import {
  WithSQSMessageId,
  AppContext,
  logger,
} from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async getEservicesReadyForPolling(
      headers: ApiGetEservicesReadyForPollingHeaders,
      query: ApiGetEservicesReadyForPollingQuery,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<ApiGetEservicesReadyForPollingResponse> {
      try {
        logger(ctx).info(
          `Performing getEservicesReadyForPolling with query parameters limit ${query.limit} offset ${query.offset}`,
        );
        return await operationsApiClient.getEservicesReadyForPolling({
          queries: query,
          headers,
        });
      } catch (error: unknown) {
        throw makeApplicationError(
          apiGetEservicesReadyForPollingError(
            `Error API getEservicesReadyForPolling. Details: ${error}`,
            error,
          ),
          logger(ctx),
        );
      }
    },
    async updateLastRequest(
      headers: ApiUpdateLastRequestHeaders,
      params: ApiUpdateLastRequestParams,
      payload: ApiUpdateLastRequestPayload,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<ApiUpdateLastRequestResponse> {
      try {
        logger(ctx).info(
          `Performing updateLastRequest with eserviceRecordId ${params.eserviceRecordId}. Payload: ${JSON.stringify(payload)}`,
        );
        return await operationsApiClient.updateLastRequest(payload, {
          params,
          headers,
        });
      } catch (error: unknown) {
        throw makeApplicationError(
          apiUpdateLastRequestError(
            `Error API updateLastRequest. Details: ${error}`,
            error,
          ),
          logger(ctx),
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
