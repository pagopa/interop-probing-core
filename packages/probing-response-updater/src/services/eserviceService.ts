import { UpdateResponseReceivedApi } from "../model/models.js";
import { ZodiosInstance } from "@zodios/core";
import { Api } from "../../../probing-eservice-operations/src/model/types.js";
import { logger } from "pagopa-interop-probing-commons";
import {
  apiUpdateResponseReceivedError,
  makeApplicationError,
} from "../model/domain/errors.js";

export const eServiceServiceBuilder = (apiClient: ZodiosInstance<Api>) => {
  return {
    async updateResponseReceived({
      params,
      payload,
    }: UpdateResponseReceivedApi): Promise<void> {
      try {
        await apiClient.updateResponseReceived(
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
            `Error updating eService response received with eserviceRecordId: ${params.eserviceRecordId}. Details: ${error}.`,
            error
          )
        );
      }
    },
  };
};

export type EserviceService = ReturnType<typeof eServiceServiceBuilder>;
