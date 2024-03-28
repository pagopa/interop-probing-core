import { logger } from "pagopa-interop-probing-commons";
import { callerConstants } from "../utilities/constants.js";
import {
  responseStatus,
  technology,
  TelemetryDto,
  EserviceContentDto,
  TelemetryKoDto,
  TelemetryOkDto,
} from "pagopa-interop-probing-models";
import { getKoReason } from "../utilities/errorMapper.js";
import { ApiClientHandler } from "../utilities/apiClientHandler.js";
import { KMSClientHandler } from "../utilities/kmsClientHandler.js";
import { match } from "ts-pattern";

export const callerServiceBuilder = (
  apiClientHandler: ApiClientHandler,
  kmsClientHandler: KMSClientHandler,
) => {
  return {
    async performRequest(eservice: EserviceContentDto): Promise<TelemetryDto> {
      logger.info(
        `Perfoming Telemetry ${eservice.technology} request with eserviceRecordId: ${eservice.eserviceRecordId}`,
      );

      const token: string = await kmsClientHandler.buildJWT(eservice.audience);
      const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

      const beforeRequestTimestamp: number = Date.now();

      try {
        await match(eservice.technology)
          .with(
            technology.soap,
            async () => await apiClientHandler.sendSOAP(baseUrl, token),
          )
          .with(
            technology.rest,
            async () => await apiClientHandler.sendREST(baseUrl, token),
          )
          .exhaustive();

        const telemetry: TelemetryOkDto = {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ok,
          responseTime: Date.now() - beforeRequestTimestamp,
        };

        return telemetry;
      } catch (error: unknown) {
        const koReason: string = getKoReason(error);

        const telemetry: TelemetryKoDto = {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ko,
          koReason,
        };

        if (koReason !== callerConstants.CONNECTION_TIMEOUT_KO_REASON) {
          telemetry.responseTime = Date.now() - beforeRequestTimestamp;
        }

        return telemetry;
      }
    },
  };
};

export type CallerService = ReturnType<typeof callerServiceBuilder>;
