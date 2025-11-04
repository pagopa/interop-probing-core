import {
  EServiceDescriptorStateV1,
  EServiceEventV1,
  EServiceTechnologyV1,
} from "@pagopa/interop-outbound-models";
import { Logger, AppContext } from "pagopa-interop-probing-commons";
import { P, match } from "ts-pattern";
import { config } from "../utilities/config.js";
import { OperationsService } from "../services/operationsService.js";
import {
  correlationIdToHeader,
  eserviceInteropState,
  kafkaMessageMissingData,
  technology,
} from "pagopa-interop-probing-models";

export async function handleMessageV1(
  event: EServiceEventV1,
  operationsService: OperationsService,
  ctx: AppContext,
  logger: Logger,
): Promise<void> {
  await match(event)
    .with(
      {
        type: P.union(
          "EServiceAdded",
          "EServiceUpdated",
          "ClonedEServiceAdded",
        ),
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        const { eservice } = evt.data;

        for (const descriptor of eservice.descriptors) {
          await operationsService.saveEservice(
            { ...correlationIdToHeader(ctx.correlationId) },
            { eserviceId: eservice.id, versionId: descriptor.id },
            {
              eserviceId: eservice.id,
              producerId: eservice.producerId,
              name: eservice.name,
              basePath: descriptor.serverUrls,
              versionNumber: Number(descriptor.version),
              technology:
                eservice.technology === EServiceTechnologyV1.SOAP
                  ? technology.soap
                  : technology.rest,
              state:
                descriptor.state === EServiceDescriptorStateV1.PUBLISHED
                  ? eserviceInteropState.active
                  : eserviceInteropState.inactive,
              audience: descriptor.audience,
            },

            logger,
          );
        }
      },
    )

    .with(
      {
        type: "EServiceDeleted",
      },
      async (evt) => {
        await operationsService.deleteEservice(
          { ...correlationIdToHeader(ctx.correlationId) },
          {
            eserviceId: evt.data.eserviceId,
          },
          logger,
        );
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
