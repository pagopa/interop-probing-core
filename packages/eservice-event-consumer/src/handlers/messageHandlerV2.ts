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
        ),
      },
      async (evt) => {
        const { eservice } = evt.data;
        if (!eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

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
                eservice.technology === EServiceTechnologyV2.SOAP
                  ? technology.soap
                  : technology.rest,
              state:
                descriptor.state === EServiceDescriptorStateV2.PUBLISHED
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
          "EServiceDescriptorPublished",
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
          "EServiceDescriptionUpdatedByTemplateUpdate",
          "EServiceDescriptorQuotasUpdatedByTemplateUpdate",
          "EServiceDescriptorAttributesUpdatedByTemplateUpdate",
          "EServiceDescriptorDocumentAddedByTemplateUpdate",
          "EServiceDescriptorDocumentUpdatedByTemplateUpdate",
          "EServiceDescriptorDocumentDeletedByTemplateUpdate",
          "EServiceNameUpdatedByTemplateUpdate",
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
