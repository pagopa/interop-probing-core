import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { eServiceByVersionIdNotFound } from "../../src/model/domain/errors.js";
import { api, eServiceService } from "../vitest.api.setup.js";
import { ApiUpdateEserviceFrequencyPayload } from "pagopa-interop-probing-eservice-operations-client";
import { genericError } from "pagopa-interop-probing-models";

describe("post /eservices/{eServiceId}/versions/{versionId}/updateFrequency router test", () => {
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  const validBody: ApiUpdateEserviceFrequencyPayload = {
    frequency: 10,
    startTime: "2025-11-11T09:00:00Z",
    endTime: "2025-11-11T18:00:00Z",
  };

  eServiceService.updateEserviceFrequency = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eServiceId: string,
    versionId: string,
    body: ApiUpdateEserviceFrequencyPayload = validBody,
  ) =>
    request(api)
      .post(`/eservices/${eServiceId}/versions/${versionId}/updateFrequency`)
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
      eServiceService.updateEserviceFrequency = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest(mockEserviceId, mockVersionId);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    [{}, mockEserviceId, mockVersionId],
    [
      {
        frequency: -1,
        startTime: "2025-11-11T09:00:00Z",
        endTime: "2025-11-11T18:00:00Z",
      },
      mockEserviceId,
      mockVersionId,
    ],
    [
      { frequency: 10, startTime: "invalid", endTime: "2025-11-11T18:00:00Z" },
      mockEserviceId,
      mockVersionId,
    ],
    [
      { frequency: 10, startTime: "2025-11-11T09:00:00Z", endTime: "invalid" },
      mockEserviceId,
      mockVersionId,
    ],
    [
      {
        frequency: 10,
        startTime: "2025-11-11T09:00:00Z",
        endTime: "2025-11-11T18:00:00Z",
      },
      "invalid-id",
      mockVersionId,
    ],
    [
      {
        frequency: 10,
        startTime: "2025-11-11T09:00:00Z",
        endTime: "2025-11-11T18:00:00Z",
      },
      mockEserviceId,
      "invalid-version-id",
    ],
  ])(
    "should return 400 if invalid payload or params are passed (case %#)",
    async (body, eServiceId, versionId) => {
      const res = await makeRequest(
        eServiceId,
        versionId,
        body as ApiUpdateEserviceFrequencyPayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
