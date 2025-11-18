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
import { errorSaveTenant } from "../src/models/domain/errors.js";

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
    it("save a new Tenant for TenantCreated event should return a successfully response", async () => {
      const tenantId = uuidv4();
      const tenantV1: TenantV1 = {
        id: tenantId,
        name: "pagoPa",
        externalId: {
          origin: "origin",
          value: uuidv4(),
        },
        features: [],
        attributes: [],
        createdAt: 1n,
      };

      const tenantV1Event = createTenantEventV1(tenantV1, uuidv4());

      vi.spyOn(apiClient, "saveTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(tenantV1Event, operationsService, ctx, genericLogger),
      ).resolves.not.toThrowError();

      expect(apiClient.saveTenant).toHaveBeenCalledTimes(1);
    });

    it("save a new Tenant for TenantCreated event should return an exception kafkaMessageMissingData", async () => {
      const tenantV1Event = createTenantEventV1(undefined, uuidv4());

      await expect(
        handleMessageV1(tenantV1Event, operationsService, ctx, genericLogger),
      ).rejects.toThrow(
        kafkaMessageMissingData(config.kafkaTopic, tenantV1Event.type),
      );
    });

    it("save a new Tenant for TenantCreated event should return an exception errorSaveTenant with validation body error", async () => {
      const tenantV1: TenantV1 = {
        id: "invalid uuid",
        name: "tenant name",
        externalId: {
          origin: "origin",
          value: "value",
        },
        features: [],
        attributes: [],
        createdAt: 1n,
      };

      const tenantV1Event = createTenantEventV1(tenantV1, uuidv4());

      const zodiosValidationError =
        "Error: Zodios: Invalid Path parameter 'tenantId'";

      await expect(
        handleMessageV1(tenantV1Event, operationsService, ctx, genericLogger),
      ).rejects.toThrow(errorSaveTenant(tenantV1.id, zodiosValidationError));
    });

    it("save a new Tenant for TenantCreated event should return generic exception errorSaveTenant", async () => {
      const tenantId = uuidv4();
      const tenantV1: TenantV1 = {
        id: tenantId,
        name: "tenant name",
        externalId: {
          origin: "origin",
          value: "value",
        },
        features: undefined as unknown as [],
        attributes: [],
        createdAt: 1n,
      };

      const tenantV1Event = createTenantEventV1(tenantV1, uuidv4());

      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(apiClientError);

      await expect(
        handleMessageV1(tenantV1Event, operationsService, ctx, genericLogger),
      ).rejects.toThrow(errorSaveTenant(tenantV1.id, apiClientError));
    });
  });

  describe("TenantUpdated Event", () => {
    it("update a Tenant for TenantUpdated event should return a successfully response", async () => {
      vi.spyOn(apiClient, "saveTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(
          mockTenantUpdateV1(uuidv4()),
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrowError();

      expect(apiClient.saveTenant).toBeCalled();
    });

    it("update an Tenant for TenantUpdated event should return an exception errorSaveTenant", async () => {
      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "saveTenant").mockRejectedValueOnce(apiClientError);

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
    it("delete an Tenant for TenantDeleted event should return a successfully response", async () => {
      vi.spyOn(apiClient, "deleteTenant").mockResolvedValueOnce(undefined);

      await expect(
        handleMessageV1(
          mockTenantDeleteV1,
          operationsService,
          ctx,
          genericLogger,
        ),
      ).resolves.not.toThrowError();

      expect(apiClient.deleteTenant).toBeCalled();
    });

    it("delete an Tenant for TenantDeleted event should return an exception errorDeleteTenant", async () => {
      const apiClientError = mockApiClientError(500, "Internal server error");

      vi.spyOn(apiClient, "deleteTenant").mockRejectedValueOnce(apiClientError);

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
