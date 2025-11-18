import { describe, expect, it, vi, afterEach } from "vitest";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { config } from "../src/utilities/config.js";
import {
  createTenantEventV1,
  mockTenantDeleteV1,
  mockTenantUpdateV1,
} from "./utils.js";
import { v4 as uuidv4 } from "uuid";
import { AppContext, genericLogger } from "pagopa-interop-probing-commons";
import { mockApiClientError } from "pagopa-interop-probing-commons-test";
import { kafkaMessageMissingData } from "pagopa-interop-probing-models";
import { handleMessageV1 } from "../src/handlers/messageHandlerV1.js";
import { TenantV1 } from "@pagopa/interop-outbound-models";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("Message handler V1 - Tenant tests", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  const ctx: AppContext = {
    serviceName: config.applicationName,
    correlationId: uuidv4(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("TenantCreated Event", () => {
    it("should save tenant successfully", async () => {
      const tenant: TenantV1 = {
        id: uuidv4(),
        name: "pagoPA",
        externalId: { origin: "origin", value: uuidv4() },
        features: [],
        attributes: [],
        createdAt: 1n,
      };

      const event = createTenantEventV1(tenant, uuidv4());

      vi.spyOn(apiClient, "saveTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).resolves.not.toThrow();

      expect(apiClient.saveTenant).toHaveBeenCalledTimes(1);
    });

    it("should throw kafkaMessageMissingData when data is missing", async () => {
      const event = createTenantEventV1(undefined, uuidv4());

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: kafkaMessageMissingData(config.kafkaTopic, event.type).code,
      });
    });

    it("should return errorSaveTenant for validation error", async () => {
      const tenant: TenantV1 = {
        id: "invalid uuid",
        name: "tenant name",
        externalId: { origin: "origin", value: "value" },
        features: [],
        attributes: [],
        createdAt: 1n,
      };

      const event = createTenantEventV1(tenant, uuidv4());

      const validationError = new Error(
        "Zodios: Invalid Path parameter 'tenantId'",
      );

      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(validationError);

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveTenant",
      });
    });

    it("should return errorSaveTenant for unexpected saveTenant error", async () => {
      const tenant: TenantV1 = {
        id: uuidv4(),
        name: "tenant name",
        externalId: { origin: "origin", value: "value" },
        features: [],
        attributes: [],
        createdAt: 1n,
      };

      const event = createTenantEventV1(tenant, uuidv4());

      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(
        mockApiClientError(500, "Internal server error"),
      );

      await expect(
        handleMessageV1(event, operationsService, ctx, genericLogger),
      ).rejects.toMatchObject({
        code: "errorSaveTenant",
      });
    });
  });

  describe("TenantUpdated Event", () => {
    it("should update tenant successfully", async () => {
      vi.spyOn(apiClient, "saveTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(
          mockTenantUpdateV1(uuidv4()),
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
        handleMessageV1(
          mockTenantUpdateV1(uuidv4()),
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorSaveTenant",
      });
    });
  });

  describe("TenantDeleted Event", () => {
    it("should delete tenant successfully", async () => {
      vi.spyOn(apiClient, "deleteTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(
          mockTenantDeleteV1,
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
        handleMessageV1(
          mockTenantDeleteV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).rejects.toMatchObject({
        code: "errorDeleteTenant",
      });
    });
  });
});
