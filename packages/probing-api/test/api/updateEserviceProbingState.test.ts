import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, operationsService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import { ProbingApiUpdateEserviceProbingStatePayload } from "../../src/model/types.js";
import { eServiceByVersionIdNotFound } from "../../src/model/domain/errors.js";

describe("post /eservices/{eserviceId}/versions/{versionId}/probing/updateState router test", () => {
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  const validBody: ProbingApiUpdateEserviceProbingStatePayload = {
    probingEnabled: true,
  };

  operationsService.updateEserviceProbingState = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eServiceId: string,
    versionId: string,
    body: ProbingApiUpdateEserviceProbingStatePayload = validBody,
  ) =>
    request(api)
      .post(
        `/eservices/${eServiceId}/versions/${versionId}/probing/updateState`,
      )
      .set("X-Correlation-Id", uuidv4())
      .send(body);

  it("should return 204 when update succeeds", async () => {
    const res = await makeRequest(mockEserviceId, mockVersionId);
    expect(res.status).toBe(204);
  });

  it.each([
    {
      error: eServiceByVersionIdNotFound(mockEserviceId, mockVersionId),
      expectedStatus: 404,
    },
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus when $error.code occurs",
    async ({ error, expectedStatus }) => {
      operationsService.updateEserviceProbingState = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest(mockEserviceId, mockVersionId);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    {
      eServiceId: mockEserviceId,
      versionId: mockVersionId,
      body: {},
    },
    {
      eServiceId: mockEserviceId,
      versionId: mockVersionId,
      body: { probingEnabled: "not-a-boolean" },
    },
    {
      eServiceId: "invalid-uuid",
      versionId: mockVersionId,
      body: validBody,
    },
    {
      eServiceId: mockEserviceId,
      versionId: "invalid-uuid",
      body: validBody,
    },
  ])(
    "should return 400 if invalid data is provided: %s",
    async ({ eServiceId, versionId, body }) => {
      const res = await makeRequest(
        eServiceId,
        versionId,
        body as ProbingApiUpdateEserviceProbingStatePayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
