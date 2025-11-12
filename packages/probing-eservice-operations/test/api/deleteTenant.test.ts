import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, tenantService } from "../vitest.api.setup.js";
import { tenantNotFound } from "../../src/model/domain/errors.js";
import { genericError } from "pagopa-interop-probing-models";

describe("delete /tenants/{tenantId}/deleteTenant router test", () => {
  const mockTenantId = uuidv4();

  tenantService.deleteTenant = vi.fn().mockResolvedValue({});

  const makeRequest = async (tenantId: string = mockTenantId) =>
    request(api)
      .delete(`/tenants/${tenantId}/deleteTenant`)
      .set("X-Correlation-Id", uuidv4());

  it("should return 204 when delete succeeds", async () => {
    const res = await makeRequest();
    expect(res.status).toBe(204);
  });

  it.each([
    {
      error: tenantNotFound(mockTenantId),
      expectedStatus: 404,
    },
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus when $error.code occurs",
    async ({ error, expectedStatus }) => {
      tenantService.deleteTenant = vi.fn().mockRejectedValueOnce(error);

      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it("should return 400 if invalid tenantId is provided", async () => {
    const res = await makeRequest("invalid-id");
    expect(res.status).toBe(400);
  });
});
