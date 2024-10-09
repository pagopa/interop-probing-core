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
  const rootCorrelationId: string = uuidv4();
  const operationCtx: AppContext = {
    serviceName: config.applicationName,
    correlationId: rootCorrelationId,
  };

  try {
    logger({
      serviceName: config.applicationName,
      correlationId: rootCorrelationId,
    }).info(`Start processing eservices ready for polling.`);

    const limit: number = config.schedulerLimit;
    let offset: number = 0;
    let totalElements: number = 0;

    do {
      operationCtx.correlationId = uuidv4();
      const data = await operationsService.getEservicesReadyForPolling(
        {
          ...correlationIdToHeader(operationCtx.correlationId),
        },
        {
          offset,
          limit,
        },
      );
      totalElements = data.totalElements;
      logger(operationCtx).info(
        `Performed getEservicesReadyForPolling with query parameters: ${JSON.stringify(
          {
            offset,
            limit,
          },
        )}`,
      );

      const promises = data.content.map(async (eservice) => {
        operationCtx.correlationId = uuidv4();

        const params: ApiUpdateLastRequestParams = {
          eserviceRecordId: eservice.eserviceRecordId,
        };
        const payload: ApiUpdateLastRequestPayload = {
          lastRequest: new Date().toISOString(),
        };
        await operationsService.updateLastRequest(
          {
            ...correlationIdToHeader(operationCtx.correlationId),
          },
          params,
          payload,
        );
        logger(operationCtx).info(
          `Performed updateLastRequest with eserviceRecordId ${params.eserviceRecordId}, payload: ${JSON.stringify(payload)}`,
        );

        await producerService.sendToCallerQueue(eservice, operationCtx);
        logger(operationCtx).info(
          `Performed sendToCallerQueue with eserviceRecordId ${eservice.eserviceRecordId}, payload: ${JSON.stringify(eservice)}`,
        );
      });
      await Promise.all(promises);

      offset += limit;
    } while (offset < totalElements);

    logger({
      serviceName: config.applicationName,
      correlationId: rootCorrelationId,
    }).info(`End processing eservices ready for polling.`);
  } catch (error: unknown) {
    throw makeApplicationError(error, logger(operationCtx));
  }
}
