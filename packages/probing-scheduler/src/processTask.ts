import { ProducerService } from "./services/producerService.js";
import { OperationsService } from "./services/operationsService.js";
import { config } from "./utilities/config.js";
import { probingEserviceOperationsApi } from "pagopa-interop-probing-api-clients";
import { AppContext, logger } from "pagopa-interop-probing-commons";
import { correlationIdToHeader } from "pagopa-interop-probing-models";
import { v4 as uuidv4 } from "uuid";
import { errorMapper } from "./utilities/errorMapper.js";

export async function processTask(
  operationsService: OperationsService,
  producerService: ProducerService,
): Promise<void> {
  const mainCtx: AppContext = {
    serviceName: config.applicationName,
    correlationId: uuidv4(),
  };

  try {
    logger(mainCtx).info(`Start processing eservices ready for polling.`);

    const limit: number = config.schedulerLimit;

    while (true) {
      const pollingCtx: AppContext = {
        ...mainCtx,
        correlationId: uuidv4(),
      };

      const data = await operationsService.getEservicesReadyForPolling(
        {
          ...correlationIdToHeader(pollingCtx.correlationId),
        },
        {
          offset: 0,
          limit,
        },
        pollingCtx,
      );

      if (!data.content.length) {
        break;
      }

      await Promise.all(
        data.content.map(async (eservice) => {
          const eserviceCtx: AppContext = {
            serviceName: config.applicationName,
            correlationId: uuidv4(),
          };

          const params: probingEserviceOperationsApi.ApiUpdateLastRequestParams =
            {
              eserviceRecordId: eservice.eserviceRecordId,
            };

          const payload: probingEserviceOperationsApi.ApiUpdateLastRequestPayload =
            {
              lastRequest: new Date().toISOString(),
            };

          await operationsService.updateLastRequest(
            {
              ...correlationIdToHeader(eserviceCtx.correlationId),
            },
            params,
            payload,
            eserviceCtx,
          );

          await producerService.sendToCallerQueue(eservice, eserviceCtx);
        }),
      );
    }

    logger(mainCtx).info(`End processing eservices ready for polling.`);
  } catch (error: unknown) {
    throw errorMapper(error, logger(mainCtx));
  }
}
