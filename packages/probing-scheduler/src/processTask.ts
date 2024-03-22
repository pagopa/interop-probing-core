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

export async function processTask(
  operationsService: OperationsService,
  producerService: ProducerService
): Promise<void> {
  try {
    const limit: number = config.schedulerLimit;
    let offset: number = 0;
    let totalElements: number = 0;

    do {
      const data = await operationsService.getEservicesReadyForPolling({
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
        await operationsService.updateLastRequest({ params, payload });
        await producerService.sendToCallerQueue(eservice);
      });
      await Promise.all(promises);

      offset += limit;
    } while (offset < totalElements);
  } catch (e: unknown) {
    throw makeApplicationError(
      e instanceof ApplicationError
        ? e
        : new Error(`Unexpected error processing scheduled task. Details: ${e}`)
    );
  }
}
