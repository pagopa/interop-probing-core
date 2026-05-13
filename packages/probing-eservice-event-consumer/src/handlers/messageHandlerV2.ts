import {
  EServiceDescriptorStateV2,
  EServiceEventV2,
  EServiceTechnologyV2,
} from "@pagopa/interop-outbound-models";
import { Logger, AppContext } from "pagopa-interop-probing-commons";
import {
  correlationIdToHeader,
  eserviceInteropState,
  kafkaMessageMissingData,
  technology,
} from "pagopa-interop-probing-models";
import { P, match } from "ts-pattern";
import { config } from "../utilities/config.js";
import { OperationsService } from "../services/operationsService.js";
import { z } from "zod";
import { sanitizeData } from "../utilities/utils.js";

export async function handleMessageV2(
  event: EServiceEventV2,
  operationsService: OperationsService,
  ctx: AppContext,
  logger: Logger,
): Promise<void> {
  await match(event)
    .with(
      {
        type: P.union(
          "EServiceAdded",
          "EServiceCloned",
          "EServiceDescriptionUpdated",
          "EServiceNameUpdated",
          "EServiceDescriptorPublished",
          "EServiceNameUpdatedByTemplateUpdate",
          "EServiceDescriptionUpdatedByTemplateUpdate",
        ),
      },
      async (evt) => {
        const { eservice } = evt.data;
        if (!eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        for (const descriptor of eservice.descriptors) {
          if (descriptor.state === EServiceDescriptorStateV2.ARCHIVED) {
            continue;
          }

          const parsedBasePath = z
            .array(z.string().transform(sanitizeData))
            .parse(descriptor.serverUrls);

          const parsedAudience = z
            .array(z.string().transform(sanitizeData))
            .parse(descriptor.audience);

          await operationsService.saveEservice(
            { ...correlationIdToHeader(ctx.correlationId) },
            { eserviceId: eservice.id, versionId: descriptor.id },
            {
              producerId: eservice.producerId,
              name: eservice.name,
              basePath: parsedBasePath,
              versionNumber: Number(descriptor.version),
              technology:
                eservice.technology === EServiceTechnologyV2.SOAP
                  ? technology.soap
                  : technology.rest,
              state: isDescriptorActive(descriptor.state)
                ? eserviceInteropState.active
                : eserviceInteropState.inactive,
              audience: parsedAudience,
            },
            logger,
          );
        }
      },
    )
    .with(
      {
        type: P.union(
          "EServiceDescriptorArchivingScheduled",
          "EServiceDescriptorArchivingCanceled",
        ),
      },
      async (evt) => {
        const { eservice, descriptorId } = evt.data;
        if (!eservice || !descriptorId) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        const descriptor = eservice.descriptors.find(
          (d) => d.id === descriptorId,
        );
        if (!descriptor) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        if (descriptor.state === EServiceDescriptorStateV2.ARCHIVED) {
          await operationsService.deleteEserviceVersion(
            { ...correlationIdToHeader(ctx.correlationId) },
            { eserviceId: eservice.id, versionId: descriptorId },
            logger,
          );
          return;
        }

        const parsedBasePath = z
          .array(z.string().transform(sanitizeData))
          .parse(descriptor.serverUrls);

        const parsedAudience = z
          .array(z.string().transform(sanitizeData))
          .parse(descriptor.audience);

        await operationsService.saveEservice(
          { ...correlationIdToHeader(ctx.correlationId) },
          { eserviceId: eservice.id, versionId: descriptor.id },
          {
            producerId: eservice.producerId,
            name: eservice.name,
            basePath: parsedBasePath,
            versionNumber: Number(descriptor.version),
            technology:
              eservice.technology === EServiceTechnologyV2.SOAP
                ? technology.soap
                : technology.rest,
            state: isDescriptorActive(descriptor.state)
              ? eserviceInteropState.active
              : eserviceInteropState.inactive,
            audience: parsedAudience,
          },
          logger,
        );
      },
    )
    .with(
      {
        type: "EServiceDescriptorArchivingCompleted",
      },
      async (evt) => {
        const { eservice, descriptorId } = evt.data;
        if (!eservice || !descriptorId) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        await operationsService.deleteEserviceVersion(
          { ...correlationIdToHeader(ctx.correlationId) },
          { eserviceId: eservice.id, versionId: descriptorId },
          logger,
        );
      },
    )
    .with(
      {
        type: P.union(
          "EServiceArchivingScheduled",
          "EServiceArchivingCanceled",
        ),
      },
      async (evt) => {
        const { eservice } = evt.data;
        if (!eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        for (const descriptor of eservice.descriptors) {
          if (descriptor.state === EServiceDescriptorStateV2.ARCHIVED) {
            await operationsService.deleteEserviceVersion(
              { ...correlationIdToHeader(ctx.correlationId) },
              { eserviceId: eservice.id, versionId: descriptor.id },
              logger,
            );
            continue;
          }

          const parsedBasePath = z
            .array(z.string().transform(sanitizeData))
            .parse(descriptor.serverUrls);

          const parsedAudience = z
            .array(z.string().transform(sanitizeData))
            .parse(descriptor.audience);

          await operationsService.saveEservice(
            { ...correlationIdToHeader(ctx.correlationId) },
            { eserviceId: eservice.id, versionId: descriptor.id },
            {
              producerId: eservice.producerId,
              name: eservice.name,
              basePath: parsedBasePath,
              versionNumber: Number(descriptor.version),
              technology:
                eservice.technology === EServiceTechnologyV2.SOAP
                  ? technology.soap
                  : technology.rest,
              state: isDescriptorActive(descriptor.state)
                ? eserviceInteropState.active
                : eserviceInteropState.inactive,
              audience: parsedAudience,
            },
            logger,
          );
        }
      },
    )
    .with(
      {
        type: "EServiceArchivingCompleted",
      },
      async (evt) => {
        const { eservice } = evt.data;
        if (!eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        await operationsService.deleteEservice(
          { ...correlationIdToHeader(ctx.correlationId) },
          { eserviceId: eservice.id },
          logger,
        );
      },
    )
    .with(
      {
        type: "EServiceDescriptorArchived",
      },
      async (evt) => {
        const { eservice, descriptorId } = evt.data;
        if (!eservice || !descriptorId) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        await operationsService.deleteEserviceVersion(
          { ...correlationIdToHeader(ctx.correlationId) },
          { eserviceId: eservice.id, versionId: descriptorId },
          logger,
        );
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
          "EServiceDescriptorDocumentAdded",
          "EServiceDescriptorDocumentDeleted",
          "EServiceDescriptorDocumentUpdated",
          "EServiceDescriptorInterfaceAdded",
          "EServiceDescriptorInterfaceDeleted",
          "EServiceDescriptorQuotasUpdated",
          "EServiceDescriptorInterfaceDeleted",
          "EServiceDescriptorInterfaceUpdated",
          "EServiceDescriptorQuotasUpdated",
          "DraftEServiceUpdated",
          "EServiceDraftDescriptorDeleted",
          "EServiceDescriptorAdded",
          "EServiceDescriptorActivated",
          "EServiceDescriptorSuspended",
          "EServiceDraftDescriptorUpdated",
          "EServiceDescriptorAttributesUpdated",
          "EServiceDescriptorSubmittedByDelegate",
          "EServiceDescriptorApprovedByDelegator",
          "EServiceDescriptorRejectedByDelegator",
          "EServiceIsConsumerDelegableEnabled",
          "EServiceIsConsumerDelegableDisabled",
          "EServiceIsClientAccessDelegableEnabled",
          "EServiceIsClientAccessDelegableDisabled",
          "EServiceDescriptorQuotasUpdatedByTemplateUpdate",
          "EServiceDescriptorAttributesUpdatedByTemplateUpdate",
          "EServiceDescriptorDocumentAddedByTemplateUpdate",
          "EServiceDescriptorDocumentUpdatedByTemplateUpdate",
          "EServiceDescriptorDocumentDeletedByTemplateUpdate",
          "EServiceDescriptorAgreementApprovalPolicyUpdated",
          "EServiceSignalHubEnabled",
          "EServiceSignalHubDisabled",
          "EServicePersonalDataFlagUpdatedAfterPublication",
          "EServicePersonalDataFlagUpdatedByTemplateUpdate",
          "EServiceInstanceLabelUpdated",
          "MaintenanceEServicePersonalDataFlagReset",
        ),
      },
      async (evt) => {
        logger.info(`Skip event ${evt.type} (not relevant)`);
      },
    )
    .exhaustive();
}

function isDescriptorActive(state: EServiceDescriptorStateV2): boolean {
  return (
    state === EServiceDescriptorStateV2.PUBLISHED ||
    state === EServiceDescriptorStateV2.DEPRECATED ||
    state === EServiceDescriptorStateV2.ARCHIVING
  );
}
