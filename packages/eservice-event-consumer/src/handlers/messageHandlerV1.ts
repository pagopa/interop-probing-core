import {
  EServiceAddedV1,
  EServiceEventV1,
  EServiceTechnologyV1,
} from "@pagopa/interop-outbound-models";
import { Logger, AppContext } from "pagopa-interop-probing-commons";
import { P, match } from "ts-pattern";
import { config } from "../utilities/config.js";
import { OperationsService } from "../services/operationService.js";
import { kafkaMessageMissingData } from "pagopa-interop-probing-models";

export async function handleMessageV1(
  event: EServiceEventV1,
  operationsService: OperationsService,
  ctx: AppContext,
  logger: Logger,
): Promise<void> {
  await match(event)
    .with(
      {
        type: P.union("EServiceAdded", "EServiceUpdated"),
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        const { eservice } = evt.data;
        const tech =
          eservice.technology === EServiceTechnologyV1.REST ? "REST" : "SOAP";
        await operationsService.saveEservice({
          params: {
            eserviceId: eservice.id,
            versionId: eservice.descriptors[0].version,
          },
          payload: {
            name: eservice.name,
            eserviceId: eservice.id,
            technology: tech,
            state: eservice.descriptors[0].state,
            basePath: eservice.descriptors[0].serverUrls // chiedere se serverUrls = basePath
            producerName: eservice.descriptors[0], // non c'è
            versionNumber: eservice.descriptors[0].version,
            audience: eservice.descriptors[0].audience
          },
        });
      },
    )

    .with(
      {
        type: "EServiceDeleted",
      },
      async (evt) => {
        // TODO: deleteEservice
      },
    )

    .with(
      {
        type: "ClonedEServiceAdded",
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw new Error("Missing eservice data");
        }

        const { eservice } = evt.data;

        await operationsService.saveEservice({
          params: { eserviceId: eservice.id, versionId: eservice.id },
          payload: {
            name: eservice.name,
            eserviceId: eservice.id,
            technology: eservice.technology as unknown as any,
          },
        });
      },
    )
    .with(
      {
        type: P.union(
          "EServiceDocumentAdded",
          "EServiceDocumentDeleted",
          "EServiceDocumentUpdated",
          "MovedAttributesFromEserviceToDescriptors",
          "EServiceDescriptorAdded",
          "EServiceDescriptorUpdated",
          "EServiceWithDescriptorsDeleted",
        ),
      },
      async (evt) => {
        logger.info(`Skip event ${evt.type} (not relevant)`);
      },
    )
    .exhaustive();
}
