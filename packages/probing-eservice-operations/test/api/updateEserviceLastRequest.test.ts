import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import { eServiceByRecordIdNotFound } from "../../src/model/domain/errors.js";
import { ApiUpdateLastRequestPayload } from "pagopa-interop-probing-eservice-operations-client";

describe("post /eservices/{eserviceRecordId}/updateLastRequest router test", () => {
  const mockEserviceRecordId = 12345;

  const validBody: ApiUpdateLastRequestPayload = {
    lastRequest: "2025-11-11T09:00:00Z",
  };

  eServiceService.updateEserviceLastRequest = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eserviceRecordId: number | string = mockEserviceRecordId,
    body: ApiUpdateLastRequestPayload = validBody,
  ) =>
    request(api)
      .post(`/eservices/${eserviceRecordId}/updateLastRequest`)
      .set("X-Correlation-Id", uuidv4())
      .send(body);

  it("should return 204 when update succeeds", async () => {
    const res = await makeRequest();
    expect(res.status).toBe(204);
  });

  it.each([
    {
      error: eServiceByRecordIdNotFound(mockEserviceRecordId),
      expectedStatus: 404,
    },
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      eServiceService.updateEserviceLastRequest = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    {
      eserviceRecordId: mockEserviceRecordId,
      body: {},
    },
    {
      eserviceRecordId: mockEserviceRecordId,
      body: { lastRequest: "invalid-date" },
    },
    {
      eserviceRecordId: "invalid-id",
      body: validBody,
    },
  ])(
    "should return 400 if invalid payload or params are provided: %s",
    async ({ eserviceRecordId, body }) => {
      const res = await makeRequest(
        eserviceRecordId,
        body as ApiUpdateLastRequestPayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
