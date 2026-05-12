import { ZodiosInstance } from "@zodios/core";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import {
  errorSaveEservice,
  errorDeleteEservice,
  errorDeleteEserviceVersion,
} from "../models/domain/errors.js";
import { Logger } from "pagopa-interop-probing-commons";

export const operationsServiceBuilder = (
  operationsApiClient: ZodiosInstance<probingEserviceOperationsApi.EServiceApi>,
) => {
  return {
    async saveEservice(
      headers: probingEserviceOperationsApi.ApiSaveEserviceHeaders,
      params: probingEserviceOperationsApi.ApiSaveEserviceParams,
      data: probingEserviceOperationsApi.ApiSaveEservicePayload,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiSaveEserviceResponse> {
      try {
        await operationsApiClient.saveEservice(
          {
            producerId: data.producerId,
            name: data.name,
            basePath: data.basePath,
            technology: data.technology,
            state: data.state,
            versionNumber: data.versionNumber,
            audience: data.audience,
          },
          {
            headers,
            params,
          },
        );

        logger.info(
          `eService saved with eserviceId: ${params.eserviceId}, versionId: ${params.versionId}, tenantId: ${data.producerId}.`,
        );
      } catch (error: unknown) {
        throw errorSaveEservice(params.eserviceId, data.producerId, error);
      }
    },
    async deleteEservice(
      headers: probingEserviceOperationsApi.ApiDeleteEserviceHeaders,
      params: probingEserviceOperationsApi.ApiDeleteEserviceParams,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiDeleteEserviceResponse> {
      try {
        await operationsApiClient.deleteEservice(undefined, {
          headers,
          params,
        });

        logger.info(`eService deleted with eserviceId: ${params.eserviceId}.`);
      } catch (error: unknown) {
        throw errorDeleteEservice(params.eserviceId, error);
      }
    },

    async deleteEserviceVersion(
      headers: probingEserviceOperationsApi.ApiDeleteEserviceVersionHeaders,
      params: probingEserviceOperationsApi.ApiDeleteEserviceVersionParams,
      logger: Logger,
    ): Promise<probingEserviceOperationsApi.ApiDeleteEserviceVersionResponse> {
      try {
        await operationsApiClient.deleteEserviceVersion(undefined, {
          headers,
          params,
        });

        logger.info(
          `eService version deleted with eserviceId: ${params.eserviceId}, versionId: ${params.versionId}.`,
        );
      } catch (error: unknown) {
        throw errorDeleteEserviceVersion(
          params.eserviceId,
          params.versionId,
          error,
        );
      }
    },
  };
};

export type OperationsService = ReturnType<typeof operationsServiceBuilder>;
