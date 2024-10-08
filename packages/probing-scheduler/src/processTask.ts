import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";
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
  const batchCorrelationId: string = uuidv4();

  try {
    logger({
      serviceName: config.applicationName,
      correlationId: rootCorrelationId,
    }).info(`Start processing eservices ready for polling.`);

    const limit: number = config.schedulerLimit;
    let offset: number = 0;
    let totalElements: number = 0;

    const batchCtx: AppContext = {
      serviceName: config.applicationName,
      correlationId: batchCorrelationId,
    };

    do {
      const headers = {
        ...correlationIdToHeader(batchCtx.correlationId),
      };

      const data = await operationsService.getEservicesReadyForPolling(headers,{
        offset,
        limit,
      });
      totalElements = data.totalElements;

      const promises = data.content.map(async (eservice) => {
        const params: ApiUpdateLastRequestParams = {
          eserviceRecordId: eservice.eserviceRecordId,
        };
        const payload: ApiUpdateLastRequestPayload = {
          lastRequest: new Date().toISOString(),
        };
        await operationsService.updateLastRequest(headers, params, payload);
        await producerService.sendToCallerQueue(eservice, batchCtx);
      });
      await Promise.all(promises);

      offset += limit;
    } while (offset < totalElements);

    logger({
      serviceName: config.applicationName,
      correlationId: rootCorrelationId,
    }).info(`End processing eservices ready for polling.`);
  } catch (e: unknown) {
    throw makeApplicationError(
      e instanceof ApplicationError
        ? e
        : new Error(
            `Unexpected error processing scheduled task. Details: ${e}`,
          ),
    );
  }
}
