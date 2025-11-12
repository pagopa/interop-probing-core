import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import { genericError, EserviceStatus } from "pagopa-interop-probing-models";
import { eServiceByRecordIdNotFound } from "../../src/model/domain/errors.js";
import { ApiUpdateResponseReceivedPayload } from "pagopa-interop-probing-eservice-operations-client";

describe("post /eservices/{eserviceRecordId}/updateResponseReceived router test", () => {
  const mockEserviceRecordId = 7890;

  const validBody: ApiUpdateResponseReceivedPayload = {
    responseReceived: "2025-11-11T10:00:00Z",
    status: EserviceStatus.Values.OK,
  };

  eServiceService.updateResponseReceived = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eserviceRecordId: number | string = mockEserviceRecordId,
    body: ApiUpdateResponseReceivedPayload = validBody,
  ) =>
    request(api)
      .post(`/eservices/${eserviceRecordId}/updateResponseReceived`)
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
      eServiceService.updateResponseReceived = vi
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
      body: { responseReceived: "invalid", status: EserviceStatus.Values.OK },
    },
    {
      eserviceRecordId: mockEserviceRecordId,
      body: {
        responseReceived: "2025-11-11T10:00:00Z",
        status: "INVALID_STATUS",
      },
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
        body as ApiUpdateResponseReceivedPayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
