import { UpdateResponseReceivedApi } from "../model/models.js";
import { ZodiosInstance } from "@zodios/core";
import {
  Api,
  ApiUpdateResponseReceivedResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import {
  AppContext,
  logger,
  WithSQSMessageId,
} from "pagopa-interop-probing-commons";
import { apiUpdateResponseReceivedError } from "../model/domain/errors.js";
import { correlationIdToHeader } from "pagopa-interop-probing-models";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async updateResponseReceived(
      { params, payload }: UpdateResponseReceivedApi,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<ApiUpdateResponseReceivedResponse> {
      try {
        await operationsApiClient.updateResponseReceived(
          {
            status: payload.status,
            responseReceived: payload.responseReceived,
          },
          {
            params: { eserviceRecordId: params.eserviceRecordId },
            headers: { ...correlationIdToHeader(ctx.correlationId) },
          },
        );

        logger(ctx).info(
          `Updating eService response received with eserviceRecordId: ${params.eserviceRecordId} and responseReceived: ${payload.responseReceived}`,
        );
      } catch (error: unknown) {
        throw apiUpdateResponseReceivedError(
          `Error updating eService response received with eserviceRecordId: ${params.eserviceRecordId}. Details: ${error}`,
          error,
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
