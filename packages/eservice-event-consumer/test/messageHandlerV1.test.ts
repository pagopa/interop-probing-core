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
import { errorSaveEservice } from "../src/models/domain/errors.js";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("Message handler V1 - EService tests", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  const ctx: AppContext = {
    serviceName: config.applicationName,
    correlationId: uuidv4(),
  };

  describe("EserviceAdded Event", () => {
    it("save a new Eservice for EServiceAdded event should return a successfully response", async () => {
      const eServiceId = uuidv4();
      const producerId = "producer-test-id";
      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
      });

      const eServiceV1Event = createEserviceAddedEventV1(eserviceV1, uuidv4());

      vi.spyOn(apiClient, "saveEservice").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(eServiceV1Event, operationsService, ctx, genericLogger),
      ).resolves.not.toThrow();

      expect(apiClient.saveEservice).toHaveBeenCalled();
    });

    it("save a new Eservice for EServiceAdded event should return an exception kafkaMessageMissingData", async () => {
      const eServiceV1Event = createEserviceAddedEventV1(undefined, uuidv4());

      await expect(
        handleMessageV1(eServiceV1Event, operationsService, ctx, genericLogger),
      ).rejects.toThrow(
        kafkaMessageMissingData(config.kafkaTopic, eServiceV1Event.type),
      );
    });

    it("save a new Eservice for EServiceAdded event should return an exception errorSaveEservice with validation body error", async () => {
      const eServiceId = uuidv4();
      const producerId = "producer-id";
      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
        name: "eservice name",
      });

      const eServiceV1Event = createEserviceAddedEventV1(eserviceV1, uuidv4());

      const zodiosValidationError =
        "Error: Zodios: Invalid Body parameter 'body'";

      await expect(
        handleMessageV1(eServiceV1Event, operationsService, ctx, genericLogger),
      ).rejects.toThrow(
        errorSaveEservice(eServiceId, producerId, zodiosValidationError),
      );
    });

    it("save a new Eservice for EServiceAdded event should return generic exception errorSaveEservice", async () => {
      const eServiceId = uuidv4();
      const producerId = uuidv4();
      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
        name: "eservice name",
      });

      const eServiceV1Event = createEserviceAddedEventV1(eserviceV1, uuidv4());

      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveEservice").mockRejectedValueOnce(apiClientError);

      await expect(
        handleMessageV1(eServiceV1Event, operationsService, ctx, genericLogger),
      ).rejects.toThrow(
        errorSaveEservice(eServiceId, producerId, apiClientError),
      );
    });
  });

  describe("EserviceUpdated Event", () => {
    it("update an Eservice for EserviceUpdated event should return a successfully response", async () => {
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

    it("update an Eservice for EserviceUpdated event should return an exception errorSaveEservice", async () => {
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
    it("delete an Eservice for EServiceDeleted event should return a successfully response", async () => {
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

    it("delete an Eservice for EServiceDeleted event should return an exception errorDeleteEservice", async () => {
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
    it("clone an Eservice for ClonedEServiceAdded event should return a successfully response", async () => {
      vi.spyOn(apiClient, "saveEservice").mockResolvedValue(undefined);

      await handleMessageV1(
        mockClonedEServiceAddedV1,
        operationsService,
        ctx,
        genericLogger,
      );

      expect(apiClient.saveEservice).toHaveBeenCalledTimes(2);
    });

    it("clone an Eservice for ClonedEServiceAdded event should return an exception errorSaveEservice", async () => {
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

  describe("Events to be ignored", () => {
    it("invoking handleMessageV1 should ignore specific event types and log an info message for each ignored event", async () => {
      const spy = vi.spyOn(genericLogger, "info");

      const events = [
        { type: "EServiceDocumentAdded" },
        { type: "EServiceDocumentDeleted" },
        { type: "EServiceDocumentUpdated" },
        { type: "MovedAttributesFromEserviceToDescriptors" },
        { type: "EServiceDescriptorAdded" },
        { type: "EServiceDescriptorUpdated" },
        { type: "EServiceWithDescriptorsDeleted" },
      ];

      for (const event of events) {
        await handleMessageV1(
          {
            event_version: 1,
            version: 1,
            type: event.type,
            timestamp: new Date(),
            stream_id: "1",
            data: {},
          } as EServiceEventV1,
          operationsService,
          ctx,
          genericLogger,
        );

        expect(spy).toHaveBeenCalledWith(
          `Skip event ${event.type} (not relevant)`,
        );
      }

      expect(spy).toHaveBeenCalledTimes(events.length);
    });
  });
});
