import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, tenantService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import { tenantNotFound } from "../../src/model/domain/errors.js";
import { ApiSaveTenantPayload } from "pagopa-interop-probing-eservice-operations-client";

describe("post /tenants/{tenantId}/saveTenant router test", () => {
  const mockTenantId = uuidv4();

  const validBody: ApiSaveTenantPayload = {
    name: "PagoPA",
  };

  tenantService.saveTenant = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    tenantId: string = mockTenantId,
    body: ApiSaveTenantPayload = validBody,
  ) =>
    request(api)
      .post(`/tenants/${tenantId}/saveTenant`)
      .set("X-Correlation-Id", uuidv4())
      .send(body);

  it("should return 204 when tenant is saved successfully", async () => {
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
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      tenantService.saveTenant = vi.fn().mockRejectedValueOnce(error);
      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    {
      tenantId: mockTenantId,
      body: {},
    },
    {
      tenantId: mockTenantId,
      body: { name: 123 },
    },
    {
      tenantId: "invalid-uuid",
      body: validBody,
    },
  ])(
    "should return 400 if invalid payload or params are provided: %s",
    async ({ tenantId, body }) => {
      const res = await makeRequest(tenantId, body as ApiSaveTenantPayload);
      expect(res.status).toBe(400);
    },
  );
});
