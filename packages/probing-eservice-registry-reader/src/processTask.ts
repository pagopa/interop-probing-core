import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";
import { ProducerService } from "./services/producerService.js";
import { BucketService } from "./services/bucketService.js";

export async function processTask(
  bucketService: BucketService,
  producerService: ProducerService,
): Promise<void> {
  try {
    const eservices = await bucketService.readObject();
    for await (const eservice of eservices) {
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
