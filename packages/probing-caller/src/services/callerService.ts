import {
  EserviceContentDto,
  TelemetryDto,
  TelemetryKoDto,
  TelemetryOkDto,
} from "../model/models.js";
import { logger } from "pagopa-interop-probing-commons";
import { callerConstants } from "../utilities/constants.js";
import { responseStatus, technology } from "pagopa-interop-probing-models";
import { getKoReason } from "../utilities/errorMapper.js";
import { ApiClientHandler } from "../utilities/apiClientHandler.js";
import { KMSClientHandler } from "../utilities/kmsClientHandler.js";
import { match } from "ts-pattern";
import {
  ApplicationError,
  makeApplicationError,
  matchTechnologyError,
} from "../model/domain/errors.js";

export const callerServiceBuilder = (
  apiClientHandler: ApiClientHandler,
  kmsClientHandler: KMSClientHandler
) => {
  return {
    async performRequest(eservice: EserviceContentDto): Promise<TelemetryDto> {
      const beforeRequestTimestamp: number = Date.now();

      try {
        const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

        logger.info(
          `Perfoming Telemetry ${eservice.technology} request with eserviceRecordId: ${eservice.eserviceRecordId}`
        );

        const token: string = await kmsClientHandler.buildJWT(
          eservice.audience
        );

        await match(eservice.technology)
          .with(
            technology.soap,
            async () => await apiClientHandler.sendSOAP(baseUrl, token)
          )
          .with(
            technology.rest,
            async () => await apiClientHandler.sendREST(baseUrl, token)
          )
          .otherwise(() => {
            throw matchTechnologyError(
              `Unrecognized technology: '${eservice.technology}'`
            );
          });

        return {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ok,
          responseTime: Date.now() - beforeRequestTimestamp,
        } satisfies TelemetryOkDto;
      } catch (error: unknown) {
        if (error instanceof ApplicationError) {
          throw makeApplicationError(error);
        }

        return {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ko,
          koReason: getKoReason(error),
          ...(getKoReason(error) !==
            callerConstants.CONNECTION_TIMEOUT_KO_REASON && {
            responseTime: Date.now() - beforeRequestTimestamp,
          }),
        } satisfies TelemetryKoDto;
      }
    },
  };
};

export type CallerService = ReturnType<typeof callerServiceBuilder>;
