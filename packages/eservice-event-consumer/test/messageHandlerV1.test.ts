import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { config } from "../src/utilities/config.js";
import {
  createEserviceAddedEventV1,
  createEServiceV1,
  mockClonedEServiceAddedV1,
  mockEserviceDeleteV1,
  mockEserviceUpdateV1,
} from "./utils.js";
import { v4 as uuidv4 } from "uuid";
import { AppContext, genericLogger } from "pagopa-interop-probing-commons";
import { mockApiClientError } from "pagopa-interop-probing-commons-test";
import { kafkaMessageMissingData } from "pagopa-interop-probing-models";
import { handleMessageV1 } from "../src/handlers/messageHandlerV1.js";
import { EServiceEventV1 } from "@pagopa/interop-outbound-models";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("Message handler V1 test", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  const ctx: AppContext = {
    serviceName: config.applicationName,
    correlationId: uuidv4(),
  };

  describe("EserviceAdded Event", () => {
    it("should save a new e-service successfully", async () => {
      const eServiceId = uuidv4();
      const producerId = "producer-test-id";
      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
      });

      const event = createEserviceAddedEventV1(eserviceV1, uuidv4());

      vi.spyOn(apiClient, "saveEservice").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).resolves.not.toThrow();

      expect(apiClient.saveEservice).toHaveBeenCalled();
    });

    it("should throw kafkaMessageMissingData when event.data is missing", async () => {
      const event = createEserviceAddedEventV1(undefined, uuidv4());

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: kafkaMessageMissingData(config.kafkaTopic, event.type).code,
      });
    });

    it("should map validation error into errorSaveEservice", async () => {
      const eServiceId = uuidv4();
      const producerId = "producer-id";

      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
        name: "eservice name",
      });

      const event = createEserviceAddedEventV1(eserviceV1, uuidv4());

      const zodiosValidationError = new Error(
        "Zodios: Invalid Body parameter 'body'",
      );

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(
        zodiosValidationError,
      );

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveEservice",
      });
    });

    it("should return errorSaveEservice when saveEservice fails unexpectedly", async () => {
      const eServiceId = uuidv4();
      const producerId = uuidv4();

      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
        name: "eservice name",
      });

      const event = createEserviceAddedEventV1(eserviceV1, uuidv4());

      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(apiClientError);

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveEservice",
      });
    });
  });

  describe("EserviceUpdated Event", () => {
    it("should update the e-service successfully", async () => {
      vi.spyOn(apiClient, "saveEservice").mockResolvedValue(undefined);

      await expect(
        handleMessageV1(
          mockEserviceUpdateV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrow();

      expect(apiClient.saveEservice).toHaveBeenCalledTimes(2);
    });

    it("should return errorSaveEservice when update fails", async () => {
      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(apiClientError);

      await expect(
        handleMessageV1(
          mockEserviceUpdateV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorSaveEservice",
      });
    });
  });

  describe("EServiceDeleted Event", () => {
    it("should delete the e-service successfully", async () => {
      vi.spyOn(apiClient, "deleteEservice").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(
          mockEserviceDeleteV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrow();

      expect(apiClient.deleteEservice).toHaveBeenCalled();
    });

    it("should return errorDeleteEservice when deleteEservice fails", async () => {
      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "deleteEservice").mockRejectedValueOnce(
        apiClientError,
      );

      await expect(
        handleMessageV1(
          mockEserviceDeleteV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorDeleteEservice",
      });
    });
  });

  describe("ClonedEServiceAdded Event", () => {
    it("should clone the e-service successfully", async () => {
      vi.spyOn(apiClient, "saveEservice").mockResolvedValue(undefined);

      await handleMessageV1(
        mockClonedEServiceAddedV1,
        operationsService,
        ctx,
        genericLogger,
      );

      expect(apiClient.saveEservice).toHaveBeenCalledTimes(2);
    });

    it("should return errorSaveEservice when cloning fails", async () => {
      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(apiClientError);

      await expect(
        handleMessageV1(
          mockClonedEServiceAddedV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorSaveEservice",
      });
    });
  });

  describe("Ignored events", () => {
    it("should skip irrelevant event types and log info", async () => {
      const spy = vi.spyOn(genericLogger, "info");

      const ignoredEvents = [
        "EServiceDocumentAdded",
        "EServiceDocumentDeleted",
        "EServiceDocumentUpdated",
        "MovedAttributesFromEserviceToDescriptors",
        "EServiceDescriptorAdded",
        "EServiceDescriptorUpdated",
        "EServiceWithDescriptorsDeleted",
      ];

      for (const type of ignoredEvents) {
        await handleMessageV1(
          {
            event_version: 1,
            version: 1,
            type,
            timestamp: new Date(),
            stream_id: "1",
            data: {},
          } as EServiceEventV1,
          operationsService,
          ctx,
          genericLogger,
        );

        expect(spy).toHaveBeenCalledWith(`Skip event ${type} (not relevant)`);
      }

      expect(spy).toHaveBeenCalledTimes(ignoredEvents.length);
    });
  });
});
