import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { config } from "../src/utilities/config.js";
import {
  createEserviceAddedEventV2,
  createV2Event,
  mockEserviceCloneV2,
  mockEserviceDeleteV2,
} from "./utils.js";
import { v4 as uuidv4 } from "uuid";
import { AppContext, genericLogger } from "pagopa-interop-probing-commons";
import { mockApiClientError } from "pagopa-interop-probing-commons-test";
import { kafkaMessageMissingData } from "pagopa-interop-probing-models";
import { handleMessageV2 } from "../src/handlers/messageHandlerV2.js";
import {
  EServiceDescriptorStateV2,
  EServiceEventV2,
} from "@pagopa/interop-outbound-models";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("Message handler V2 test", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  const ctx: AppContext = {
    serviceName: config.applicationName,
    correlationId: uuidv4(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("EserviceAdded Event", () => {
    it("should save the E-service successfully", async () => {
      const eServiceId = uuidv4();
      const descriptorId = uuidv4();
      const producerId = "producer-test-idV2";

      const eServiceV2 = createV2Event(
        eServiceId,
        descriptorId,
        producerId,
        EServiceDescriptorStateV2.DRAFT,
      );

      const eServiceV2Event = createEserviceAddedEventV2(eServiceV2);

      vi.spyOn(apiClient, "saveEservice").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV2(eServiceV2Event, operationsService, ctx, genericLogger),
      ).resolves.not.toThrow();

      expect(apiClient.saveEservice).toHaveBeenCalledTimes(1);
    });

    it("should throw kafkaMessageMissingData when the data section is missing", async () => {
      const eServiceId = uuidv4();
      const descriptorId = uuidv4();
      const producerId = "producer-test-idV2";

      const event = createEserviceAddedEventV2(
        createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT,
        ),
      );

      await expect(
        handleMessageV2(
          { ...event, data: {} } as EServiceEventV2,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: kafkaMessageMissingData(config.kafkaTopic, event.type).code,
      });
    });

    it("should return errorSaveEservice when validation error occurs", async () => {
      const eServiceId = uuidv4();
      const descriptorId = uuidv4();
      const producerId = "producer-test-idV2";

      const event = createEserviceAddedEventV2(
        createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT,
        ),
      );

      const validationError = new Error(
        "Zodios: Invalid Body parameter 'body'",
      );

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(
        validationError,
      );

      await expect(
        handleMessageV2(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveEservice",
      });
    });

    it("should return errorSaveEservice for unexpected saveEservice error", async () => {
      const eServiceId = uuidv4();
      const descriptorId = uuidv4();
      const producerId = "producer-test-idV2";

      const event = createEserviceAddedEventV2(
        createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT,
        ),
      );

      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(apiClientError);

      await expect(
        handleMessageV2(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveEservice",
      });
    });
  });

  describe("EServiceDeleted Event", () => {
    it("should delete the E-service successfully", async () => {
      vi.spyOn(apiClient, "deleteEservice").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV2(
          mockEserviceDeleteV2,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrow();

      expect(apiClient.deleteEservice).toHaveBeenCalled();
    });

    it("should return errorDeleteEservice when API delete fails", async () => {
      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "deleteEservice").mockRejectedValueOnce(
        apiClientError,
      );

      await expect(
        handleMessageV2(
          mockEserviceDeleteV2,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorDeleteEservice",
      });
    });
  });

  describe("EserviceClone Event", () => {
    it("should clone an E-service successfully", async () => {
      vi.spyOn(apiClient, "saveEservice").mockResolvedValue(undefined);

      await handleMessageV2(
        mockEserviceCloneV2,
        operationsService,
        ctx,
        genericLogger,
      );

      expect(apiClient.saveEservice).toHaveBeenCalledTimes(2);
    });
  });

  describe("Events to be ignored", () => {
    it("should skip ignored event types and log an info", async () => {
      const spy = vi.spyOn(genericLogger, "info");

      const events = [
        "EServiceDescriptorDocumentAdded",
        "EServiceDescriptorDocumentDeleted",
        "EServiceDescriptorDocumentUpdated",
        "EServiceDescriptorInterfaceAdded",
        "EServiceDescriptorInterfaceDeleted",
        "EServiceDescriptorQuotasUpdated",
        "EServiceDescriptorInterfaceUpdated",
        "DraftEServiceUpdated",
        "EServiceDraftDescriptorDeleted",
        "EServiceDescriptorAdded",
        "EServiceDescriptorActivated",
        "EServiceDescriptorArchived",
        "EServiceDescriptorPublished",
        "EServiceDescriptorSuspended",
        "EServiceDraftDescriptorUpdated",
      ];

      for (const type of events) {
        await handleMessageV2(
          {
            event_version: 2,
            version: 1,
            type: type,
            timestamp: new Date(),
            stream_id: "1",
            data: {},
          } as EServiceEventV2,
          operationsService,
          ctx,
          genericLogger,
        );

        expect(spy).toHaveBeenCalledWith(`Skip event ${type} (not relevant)`);
      }

      expect(spy).toHaveBeenCalledTimes(events.length);
    });
  });
});
