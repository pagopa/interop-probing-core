import { UpdateResponseReceivedApi } from "../model/models.js";
import { ZodiosInstance } from "@zodios/core";
import { Api } from "pagopa-interop-probing-eservice-operations-client";
import { logger } from "pagopa-interop-probing-commons";
import {
  apiUpdateResponseReceivedError,
  makeApplicationError,
} from "../model/domain/errors.js";

export const operationsServiceBuilder = (operationsApiClient: ZodiosInstance<Api>) => {
  return {
    async updateResponseReceived({
      params,
      payload,
    }: UpdateResponseReceivedApi): Promise<void> {
      try {
        await operationsApiClient.updateResponseReceived(
          {
            status: payload.status,
            responseReceived: payload.responseReceived,
          },
          { params: { eserviceRecordId: params.eserviceRecordId } }
        );

        logger.info(
          `Updating eService response received with eserviceRecordId: ${params.eserviceRecordId} and responseReceived: ${payload.responseReceived}`
        );
      } catch (error: unknown) {
        throw makeApplicationError(
          apiUpdateResponseReceivedError(
            `Error updating eService response received with eserviceRecordId: ${params.eserviceRecordId}. Details: ${error}`,
            error
          )
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
