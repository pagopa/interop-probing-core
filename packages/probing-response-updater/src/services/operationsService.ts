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
import {
  correlationIdToHeader,
  UpdateResponseReceivedDto,
} from "pagopa-interop-probing-models";
import { apiUpdateResponseReceivedError } from "../model/domain/errors.js";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>,
) => {
  return {
    async updateResponseReceived(
      eserviceRecordId: number,
      payload: Pick<UpdateResponseReceivedDto, "status" | "responseReceived">,
      ctx: WithSQSMessageId<AppContext>,
    ): Promise<ApiUpdateResponseReceivedResponse> {
      try {
        logger(ctx).info(
          `Updating eService response received with eserviceRecordId: ${eserviceRecordId} and responseReceived: ${payload.responseReceived}`,
        );

        await operationsApiClient.updateEserviceResponseReceived(
          {
            status: payload.status,
            responseReceived: payload.responseReceived,
          },
          {
            params: { eserviceRecordId },
            headers: { ...correlationIdToHeader(ctx.correlationId) },
          },
        );
      } catch (error: unknown) {
        throw apiUpdateResponseReceivedError(eserviceRecordId, error);
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
