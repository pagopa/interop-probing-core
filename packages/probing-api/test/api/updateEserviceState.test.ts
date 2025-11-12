import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, operationsService } from "../vitest.api.setup.js";
import {
  EserviceInteropState,
  genericError,
} from "pagopa-interop-probing-models";
import { ProbingApiUpdateEserviceStatePayload } from "../../src/model/types.js";
import { eServiceByVersionIdNotFound } from "../../src/model/domain/errors.js";

describe("post /eservices/{eserviceId}/versions/{versionId}/updateState router test", () => {
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  const validBody: ProbingApiUpdateEserviceStatePayload = {
    eServiceState: EserviceInteropState.Values.ACTIVE,
  };

  operationsService.updateEserviceState = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eServiceId: string,
    versionId: string,
    body: ProbingApiUpdateEserviceStatePayload = validBody,
  ) =>
    request(api)
      .post(`/eservices/${eServiceId}/versions/${versionId}/updateState`)
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
      operationsService.updateEserviceState = vi
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
      body: { eServiceState: "INVALID_STATE" },
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
    "should return 400 if invalid path params are provided: %s",
    async ({ eServiceId, versionId, body }) => {
      const res = await makeRequest(
        eServiceId,
        versionId,
        body as ProbingApiUpdateEserviceStatePayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
