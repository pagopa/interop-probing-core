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
              eserviceId: eservice.id,
              producerId: eservice.producerId,
              name: eservice.name,
              basePath: parsedBasePath,
              versionNumber: Number(descriptor.version),
              technology:
                eservice.technology === EServiceTechnologyV2.SOAP
                  ? technology.soap
                  : technology.rest,
              state:
                descriptor.state === EServiceDescriptorStateV2.PUBLISHED
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
          "EServiceDescriptorArchived",
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
        ),
      },
      async (evt) => {
        logger.info(`Skip event ${evt.type} (not relevant)`);
      },
    )
    .exhaustive();
}
