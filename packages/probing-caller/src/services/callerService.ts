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
import { makeApplicationError } from "../model/domain/errors.js";
import { AxiosError } from "axios";

export const callerServiceBuilder = (
  apiClientHandler: ApiClientHandler,
  kmsClientHandler: KMSClientHandler
) => {
  return {
    async performRequest(eservice: EserviceContentDto): Promise<TelemetryDto> {
      let beforeRequestTimestamp!: number;

      try {
        const baseUrl = `${eservice.basePath[0]}${callerConstants.PROBING_ENDPOINT_SUFFIX}`;

        logger.info(
          `Perfoming Telemetry ${eservice.technology} request with eserviceRecordId: ${eservice.eserviceRecordId}`
        );

        const token: string = await kmsClientHandler.buildJWT(
          eservice.audience
        );

        await match(eservice.technology)
          .with(technology.soap, async () => {
            beforeRequestTimestamp = Date.now();
            await apiClientHandler.sendSOAP(baseUrl, token);
          })
          .with(technology.rest, async () => {
            beforeRequestTimestamp = Date.now();
            await apiClientHandler.sendREST(baseUrl, token);
          })
          .exhaustive();

        const telemetry: TelemetryOkDto = {
          eserviceRecordId: eservice.eserviceRecordId,
          checkTime: beforeRequestTimestamp.toString(),
          status: responseStatus.ok,
          responseTime: Date.now() - beforeRequestTimestamp,
        };

        return telemetry;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
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
        } else {
          throw makeApplicationError(error);
        }
      }
    },
  };
};

export type CallerService = ReturnType<typeof callerServiceBuilder>;
