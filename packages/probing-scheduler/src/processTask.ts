import { makeApplicationError } from "./model/domain/errors.js";
import { ProducerService } from "./services/producerService.js";
import { OperationsService } from "./services/operationsService.js";
import { config } from "./utilities/config.js";
import {
  ApiUpdateLastRequestParams,
  ApiUpdateLastRequestPayload,
} from "pagopa-interop-probing-eservice-operations-client";
import { AppContext, logger } from "pagopa-interop-probing-commons";
import { correlationIdToHeader } from "pagopa-interop-probing-models";
import { v4 as uuidv4 } from "uuid";

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
    let offset: number = 0;
    let totalElements: number = 0;

    do {
      const pollingCtx: AppContext = {
        ...mainCtx,
        correlationId: uuidv4(),
      };
      const data = await operationsService.getEservicesReadyForPolling(
        {
          ...correlationIdToHeader(pollingCtx.correlationId),
        },
        {
          offset,
          limit,
        },
        pollingCtx,
      );
      totalElements = data.totalElements;

      const promises = data.content.map(async (eservice) => {
        const eserviceCtx: AppContext = {
          serviceName: config.applicationName,
          correlationId: uuidv4(),
        };

        const params: ApiUpdateLastRequestParams = {
          eserviceRecordId: eservice.eserviceRecordId,
        };
        const payload: ApiUpdateLastRequestPayload = {
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
      });
      await Promise.all(promises);

      offset += limit;
    } while (offset < totalElements);

    logger(mainCtx).info(`End processing eservices ready for polling.`);
  } catch (error: unknown) {
    throw makeApplicationError(error, logger(mainCtx));
  }
}
