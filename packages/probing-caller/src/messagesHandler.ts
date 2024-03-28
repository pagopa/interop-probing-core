import { SQS } from "pagopa-interop-probing-commons";
import { CallerService } from "./services/callerService.js";
import { decodeSQSMessage } from "./model/models.js";
import {
  ApplicationError,
  makeApplicationError,
} from "./model/domain/errors.js";
import { ProducerService } from "./services/producerService.js";
import {
  UpdateResponseReceivedDto,
  TelemetryDto,
} from "pagopa-interop-probing-models";

export function processMessage(
  callerService: CallerService,
  producerService: ProducerService,
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    try {
      const telemetryResult: TelemetryDto = await callerService.performRequest(
        decodeSQSMessage(message),
      );
      const pollingResult: UpdateResponseReceivedDto = {
        eserviceRecordId: telemetryResult.eserviceRecordId,
        status: telemetryResult.status,
        responseReceived: new Date().toISOString(),
      };

      await producerService.sendToTelemetryWriterQueue(telemetryResult);
      await producerService.sendToResponseUpdaterQueue(pollingResult);
    } catch (e: unknown) {
      throw makeApplicationError(
        e instanceof ApplicationError
          ? e
          : new Error(
              `Unexpected error handling message with MessageId: ${message.MessageId}. Details: ${e}`,
            ),
      );
    }
  };
}
