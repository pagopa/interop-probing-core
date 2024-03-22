import { SaveEserviceApi } from "../model/models.js";
import { ZodiosInstance } from "@zodios/core";
import { Api } from "pagopa-interop-probing-eservice-operations-client";
import { logger } from "pagopa-interop-probing-commons";
import {
  apiSaveEserviceError,
  makeApplicationError,
} from "../model/domain/errors.js";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<Api>
) => {
  return {
    async saveEservice({ params, payload }: SaveEserviceApi): Promise<void> {
      try {
        logger.info(
          `Saving eService with eserviceId/versionId: ${params.eserviceId}/${params.versionId}`
        );

        await operationsApiClient.saveEservice(payload, { params });
      } catch (error: unknown) {
        throw makeApplicationError(
          apiSaveEserviceError(
            `Error saving eService with eserviceId/versionId: ${params.eserviceId}/${params.versionId}}. Details: ${error}`,
            error
          )
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
