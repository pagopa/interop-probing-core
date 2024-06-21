import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";
import { ProducerService } from "./services/producerService.js";
import { BucketService } from "./services/bucketService.js";
import { genericLogger } from "pagopa-interop-probing-commons";

export async function processTask(
  bucketService: BucketService,
  producerService: ProducerService,
): Promise<void> {
  try {
    const eservices = await bucketService.readObject();
    for await (const eservice of eservices) {
      genericLogger.info(
        `Sending to queue eserviceId ${eservice.eserviceId} and versionId ${eservice.versionId} `,
      );
      await producerService.sendToServicesQueue(eservice);
    }
  } catch (e: unknown) {
    throw makeApplicationError(
      e instanceof ApplicationError
        ? e
        : new Error(
            `Unexpected error processing task registry reader. Details: ${e}`,
          ),
    );
  }
}
