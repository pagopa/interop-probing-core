import { describe, expect, it, vi, afterEach } from "vitest";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { config } from "../src/utilities/config.js";
import {
  createTenantEventV2,
  mockTenantDeleteV2,
  mockTenantUpdateV2,
} from "./utils.js";
import { v4 as uuidv4 } from "uuid";
import { AppContext, genericLogger } from "pagopa-interop-probing-commons";
import { mockApiClientError } from "pagopa-interop-probing-commons-test";
import { kafkaMessageMissingData } from "pagopa-interop-probing-models";
import { handleMessageV2 } from "../src/handlers/messageHandlerV2.js";
import { TenantEventV2, TenantV2 } from "@pagopa/interop-outbound-models";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("Message handler V2 - Tenant tests", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  const ctx: AppContext = {
    serviceName: config.applicationName,
    correlationId: uuidv4(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("TenantOnboarded Event", () => {
    it("should save tenant successfully", async () => {
      const tenantId = uuidv4();
      const tenantV2: TenantV2 = {
        id: tenantId,
        name: "pagoPa",
        selfcareId: "selfcareId",
        externalId: { origin: "origin", value: uuidv4() },
        features: [],
        attributes: [],
        createdAt: 1n,
        onboardedAt: 1n,
      };

      const event = createTenantEventV2(tenantV2, uuidv4());

      vi.spyOn(apiClient, "saveTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV2(event, operationsService, ctx, genericLogger),
      ).resolves.not.toThrow();

      expect(apiClient.saveTenant).toHaveBeenCalledTimes(1);
    });

    it("should throw kafkaMessageMissingData when data missing", async () => {
      const event = createTenantEventV2(undefined, uuidv4());

      await expect(
        handleMessageV2(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: kafkaMessageMissingData(config.kafkaTopic, event.type).code,
      });
    });

    it("should return errorSaveTenant for validation error", async () => {
      const tenantV2: TenantV2 = {
        id: "invalid uuid",
        name: "tenant name",
        selfcareId: "selfcareId",
        externalId: { origin: "origin", value: "value" },
        features: [],
        attributes: [],
        createdAt: 1n,
        onboardedAt: 1n,
      };

      const event = createTenantEventV2(tenantV2, uuidv4());

      const validationError = new Error(
        "Zodios: Invalid Path parameter 'tenantId'",
      );

      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(validationError);

      await expect(
        handleMessageV2(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveTenant",
      });
    });

    it("should return errorSaveTenant for unexpected saveTenant error", async () => {
      const tenantId = uuidv4();
      const tenantV2: TenantV2 = {
        id: tenantId,
        name: "tenant name",
        selfcareId: "selfcareId",
        externalId: { origin: "origin", value: "value" },
        features: [],
        attributes: [],
        createdAt: 1n,
        onboardedAt: 1n,
      };

      const event = createTenantEventV2(tenantV2, uuidv4());

      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(
        mockApiClientError(500, "Internal server error"),
      );

      await expect(
        handleMessageV2(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveTenant",
      });
    });
  });

  describe("TenantOnboardDetailsUpdated Event", () => {
    it("should update tenant successfully", async () => {
      vi.spyOn(apiClient, "saveTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV2(
          mockTenantUpdateV2(uuidv4()),
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrow();

      expect(apiClient.saveTenant).toHaveBeenCalled();
    });

    it("should return errorSaveTenant when update fails", async () => {
      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(
        mockApiClientError(500, "Internal server error"),
      );

      await expect(
        handleMessageV2(
          mockTenantUpdateV2(uuidv4()),
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorSaveTenant",
      });
    });
  });

  describe("MaintenanceTenantDeleted Event", () => {
    it("should delete tenant successfully", async () => {
      vi.spyOn(apiClient, "deleteTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV2(
          mockTenantDeleteV2,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrow();

      expect(apiClient.deleteTenant).toHaveBeenCalled();
    });

    it("should return errorDeleteTenant when delete fails", async () => {
      vi.spyOn(apiClient, "deleteTenant").mockRejectedValueOnce(
        mockApiClientError(500, "Internal server error"),
      );

      await expect(
        handleMessageV2(
          mockTenantDeleteV2,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorDeleteTenant",
      });
    });
  });

  describe("Events to be ignored", () => {
    it("should skip irrelevant event types and log info", async () => {
      const spy = vi.spyOn(genericLogger, "info");

      const ignoredEvents = [
        "TenantCertifiedAttributeAssigned",
        "TenantCertifiedAttributeRevoked",
        "TenantDeclaredAttributeAssigned",
        "TenantDeclaredAttributeRevoked",
        "TenantVerifiedAttributeAssigned",
        "TenantVerifiedAttributeRevoked",
        "TenantVerifiedAttributeExpirationUpdated",
        "TenantVerifiedAttributeExtensionUpdated",
        "TenantKindUpdated",
        "MaintenanceTenantPromotedToCertifier",
      ];

      for (const type of ignoredEvents) {
        await handleMessageV2(
          {
            event_version: 2,
            version: 1,
            type,
            timestamp: new Date(),
            stream_id: "1",
            data: {},
          } as TenantEventV2,
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
