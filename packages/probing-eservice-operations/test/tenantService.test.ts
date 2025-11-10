import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { config } from "../src/utilities/config.js";
import {
  TenantQuery,
  tenantQueryBuilder,
} from "../src/services/db/tenantQuery.js";
import {
  tenantServiceBuilder,
  TenantService,
} from "../src/services/tenantService.js";
import {
  ModelService,
  modelServiceBuilder,
} from "../src/services/db/dbService.js";
import {
  ModelRepository,
  TenantEntities,
} from "../src/repositories/modelRepository.js";
import { v4 as uuidv4 } from "uuid";
import {
  ApiSaveTenantParams,
  ApiSaveTenantPayload,
} from "pagopa-interop-probing-eservice-operations-client";
import { addTenant } from "./utils.js";

describe("database test", async () => {
  let tenants: TenantEntities;
  let modelRepository: ModelRepository;
  let modelService: ModelService;
  let tenantQuery: TenantQuery;
  let tenantService: TenantService;

  beforeAll(async () => {
    modelRepository = await ModelRepository.init(config);
    tenants = modelRepository.tenants;
    modelService = modelServiceBuilder(modelRepository);
    tenantQuery = tenantQueryBuilder(modelService);
    tenantService = tenantServiceBuilder(tenantQuery);
  });

  afterEach(async () => {
    await tenants.deleteAll();
  });

  describe("Tenant service", () => {
    describe("saveTenant", () => {
      it("should save an tenant successfully", async () => {
        const tenantParams: ApiSaveTenantParams = {
          tenantId: uuidv4(),
        };
        const tenantPayload: ApiSaveTenantPayload = {
          name: "tenant name",
        };

        await tenantService.saveTenant(tenantParams, tenantPayload);

        const result = await tenants.findOneBy({
          tenantId: tenantParams.tenantId,
        });

        expect(result?.tenantId).toBe(tenantParams.tenantId);
      });

      it("should update name of existing tenant successfully", async () => {
        const tenantParams: ApiSaveTenantParams = {
          tenantId: uuidv4(),
        };
        const tenantPayload: ApiSaveTenantPayload = {
          name: "tenant 001",
        };

        await addTenant(
          { tenantName: tenantPayload.name, tenantId: tenantParams.tenantId },
          modelRepository.tenants,
        );

        const tenantPayloadUpdated = {
          name: "tenant name updated",
        };

        await tenantService.saveTenant(tenantParams, tenantPayloadUpdated);

        const result = await tenants.findOneBy({
          tenantId: tenantParams.tenantId,
        });

        expect(result?.tenantName).toBe(tenantPayloadUpdated.name);
      });

      it("should throw an error if the tenantId param is invalid", async () => {
        const invalidTenantParams = {
          tenantId: "invalid_tenant_id",
        };

        await expect(
          tenantService.saveTenant(invalidTenantParams, {}),
        ).rejects.toThrowError(/invalid input syntax for type uuid/);
      });
    });

    describe("deleteTenant", () => {
      it("should delete an tenant successfully", async () => {
        const tenantParams: ApiSaveTenantParams = {
          tenantId: uuidv4(),
        };
        const tenantPayload: ApiSaveTenantPayload = {
          name: "tenant 001",
        };

        await addTenant(
          { tenantName: tenantPayload.name, tenantId: tenantParams.tenantId },
          modelRepository.tenants,
        );

        await tenantService.deleteTenant(tenantParams.tenantId);

        const result = await tenants.findOneBy({
          tenantId: tenantParams.tenantId,
        });

        expect(result).toBe(null);
      });

      it("should throw an error if the tenantId param is invalid", async () => {
        const invalidTenantParams = {
          tenantId: "invalid_tenant_id",
        };

        await expect(
          tenantService.deleteTenant(invalidTenantParams.tenantId),
        ).rejects.toThrowError(/invalid input syntax for type uuid/);
      });
    });
  });
});
