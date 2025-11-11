import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { eServiceByVersionIdNotFound } from "../../src/model/domain/errors.js";
import { api, eServiceService } from "../vitest.api.setup.js";
import { ApiUpdateEserviceProbingStatePayload } from "pagopa-interop-probing-eservice-operations-client";
import { genericError } from "pagopa-interop-probing-models";

describe("post /eservices/{eServiceId}/versions/{versionId}/probing/updateState router test", () => {
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  const validBody: ApiUpdateEserviceProbingStatePayload = {
    probingEnabled: true,
  };

  eServiceService.updateEserviceProbingState = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eServiceId: string,
    versionId: string,
    body: ApiUpdateEserviceProbingStatePayload = validBody,
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
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      eServiceService.updateEserviceProbingState = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest(mockEserviceId, mockVersionId);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    [{}, mockEserviceId, mockVersionId],
    [{ probingEnabled: "INVALID" }, mockEserviceId, mockVersionId],
    [{ probingEnabled: true }, "invalid-id", mockVersionId],
    [{ probingEnabled: true }, mockEserviceId, "invalid-version-id"],
  ])(
    "should return 400 if invalid payload or params are passed (case %#)",
    async (body, eServiceId, versionId) => {
      const res = await makeRequest(
        eServiceId,
        versionId,
        body as ApiUpdateEserviceProbingStatePayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
