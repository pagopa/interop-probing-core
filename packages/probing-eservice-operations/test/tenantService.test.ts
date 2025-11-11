import { describe, expect, it } from "vitest";
import { v4 as uuidv4 } from "uuid";
import {
  ApiSaveTenantParams,
  ApiSaveTenantPayload,
} from "pagopa-interop-probing-eservice-operations-client";
import { tenantsInProbing } from "../src/db/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { db, tenantService } from "./utils.js";

describe("Tenant service", async () => {
  describe("saveTenant", () => {
    it("should save an tenant successfully", async () => {
      const tenantParams: ApiSaveTenantParams = {
        tenantId: uuidv4(),
      };
      const tenantPayload: ApiSaveTenantPayload = {
        name: "tenant name",
      };

      await tenantService.saveTenant(tenantParams, tenantPayload);

      const [tenant] = await db
        .select()
        .from(tenantsInProbing)
        .where(eq(tenantsInProbing.tenantId, tenantParams.tenantId))
        .limit(1);

      expect(tenant?.tenantId).toBe(tenantParams.tenantId);
    });

    it("should update name of existing tenant successfully", async () => {
      const tenantParams: ApiSaveTenantParams = {
        tenantId: uuidv4(),
      };
      const tenantPayload: ApiSaveTenantPayload = {
        name: "tenant 001",
      };

      await db.insert(tenantsInProbing).values({
        tenantId: tenantParams.tenantId,
        tenantName: tenantPayload.name,
      });

      const tenantPayloadUpdated = {
        name: "tenant name updated",
      };

      await tenantService.saveTenant(tenantParams, tenantPayloadUpdated);

      const [tenant] = await db
        .select()
        .from(tenantsInProbing)
        .where(eq(tenantsInProbing.tenantId, tenantParams.tenantId))
        .limit(1);

      expect(tenant?.tenantName).toBe(tenantPayloadUpdated.name);
    });

    it("should throw an error if the tenantId param is invalid", async () => {
      const invalidTenantParams = {
        tenantId: "invalid_tenant_id",
      };

      await expect(
        tenantService.saveTenant(invalidTenantParams, {}),
      ).rejects.toThrow();
    });

    it("should throw when saving tenant with missing name", async () => {
      const tenantParams: ApiSaveTenantParams = { tenantId: uuidv4() };
      const invalidPayload = {};

      await expect(
        tenantService.saveTenant(tenantParams, invalidPayload),
      ).rejects.toThrow();
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

      await db.insert(tenantsInProbing).values({
        tenantId: tenantParams.tenantId,
        tenantName: tenantPayload.name,
      });

      await tenantService.deleteTenant(tenantParams.tenantId);

      const [tenant] = await db
        .select()
        .from(tenantsInProbing)
        .where(eq(tenantsInProbing.tenantId, tenantParams.tenantId))
        .limit(1);

      expect(tenant).toBeUndefined();
    });

    it("should throw an error if the tenantId param is invalid", async () => {
      const invalidTenantParams = {
        tenantId: "invalid_tenant_id",
      };

      await expect(
        tenantService.deleteTenant(invalidTenantParams.tenantId),
      ).rejects.toThrow();
    });
  });
});
