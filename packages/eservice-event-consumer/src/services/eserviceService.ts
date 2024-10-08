import { Logger } from "pagopa-interop-probing-commons";
import {
  ApiSaveEservicePayload,
  ApiSaveEserviceResponse,
} from "pagopa-interop-probing-eservice-operations-client";
import { EserviceSaveRequest } from "pagopa-interop-probing-models";

export function eServiceServiceBuilder(eserviceClient: any) {
  return {
    async saveEservice(
      eserviceId: string,
      versionId: string,
      payload: ApiSaveEservicePayload,
      logger: Logger,
    ): Promise<ApiSaveEserviceResponse> {
      const eServiceToBeUpdated: EserviceSaveRequest = {
        state: payload.state,
        eserviceName: payload.name,
        producerName: payload.producerName,
        basePath: payload.basePath,
        technology: payload.technology,
        versionNumber: payload.versionNumber,
        audience: payload.audience,
      };

      logger.info(
        `Save eService with eserviceId: ${eserviceId}, versionId: ${versionId}`,
      );
      return await eserviceClient.saveEservice(
        eserviceId,
        versionId,
        eServiceToBeUpdated,
      );
    },
  };
}
