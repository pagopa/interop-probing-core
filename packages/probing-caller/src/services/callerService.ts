import { EserviceContentDto, TelemetryDto } from "../model/models.js";
import { logger } from "pagopa-interop-probing-commons";
import { callerConstants } from "../utilities/constants.js";
import { responseStatus, technology } from "pagopa-interop-probing-models";
import { getKoReason } from "../utilities/errorMapper.js";
import { ClientHandler } from "../utilities/clientHandler.js";

export const callerServiceBuilder = (clientHandler: ClientHandler) => {
  return {
    async performRequest(eservice: EserviceContentDto): Promise<TelemetryDto> {
      const beforeRequestTimestamp: number = Date.now();

      try {
        const baseUrl = `${eservice.basePath[0]}/${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

        logger.info(
          `Perfoming Telemetry ${eservice.technology} request with eserviceRecordId: ${eservice.eserviceRecordId}`
        );

        switch (eservice.technology) {
          case technology.soap:
            await clientHandler.sendSOAP(baseUrl);
            break;
          default:
            await clientHandler.sendREST(baseUrl);
        }

        return {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ok,
          responseTime: Date.now() - beforeRequestTimestamp,
        };
      } catch (error: unknown) {
        return {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ko,
          koReason: getKoReason(error),
          ...(getKoReason(error) !==
            callerConstants.CONNECTION_TIMEOUT_KO_REASON && {
            responseTime: Date.now() - beforeRequestTimestamp,
          }),
        };
      }
    },
  };
};

export type CallerService = ReturnType<typeof callerServiceBuilder>;
