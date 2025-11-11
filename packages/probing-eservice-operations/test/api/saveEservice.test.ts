import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { eServiceByVersionIdNotFound } from "../../src/model/domain/errors.js";
import { api, eServiceService } from "../vitest.api.setup.js";
import { ApiSaveEservicePayload } from "pagopa-interop-probing-eservice-operations-client";
import {
  EserviceInteropState,
  EserviceTechnology,
  genericError,
} from "pagopa-interop-probing-models";

describe("post /eservices/{eServiceId}/versions/{versionId}/saveEservice router test", () => {
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  const validBody: ApiSaveEservicePayload = {
    name: "Test Eservice",
    producerId: uuidv4(),
    basePath: ["/api/v1/test"],
    technology: EserviceTechnology.Values.REST,
    state: EserviceInteropState.Values.ACTIVE,
    versionNumber: 1,
    audience: ["public"],
  };

  eServiceService.saveEservice = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eServiceId: string,
    versionId: string,
    body: ApiSaveEservicePayload = validBody,
  ) =>
    request(api)
      .post(`/eservices/${eServiceId}/versions/${versionId}/saveEservice`)
      .set("X-Correlation-Id", uuidv4())
      .send(body);

  it("should return 204 when save succeeds", async () => {
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
      eServiceService.saveEservice = vi.fn().mockRejectedValueOnce(error);

      const res = await makeRequest(mockEserviceId, mockVersionId);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    [{}, mockEserviceId, mockVersionId],
    [
      {
        name: "Partial service",
        producerId: uuidv4(),
      },
      mockEserviceId,
      mockVersionId,
    ],
    [
      {
        ...validBody,
        technology: "INVALID_TECHNOLOGY",
      },
      mockEserviceId,
      mockVersionId,
    ],
    [
      {
        ...validBody,
        state: "INVALID_STATE",
      },
      mockEserviceId,
      mockVersionId,
    ],
    [
      {
        ...validBody,
        versionNumber: -1,
      },
      mockEserviceId,
      mockVersionId,
    ],
    [
      {
        ...validBody,
        versionNumber: "invalid-version-number",
      },
      mockEserviceId,
      mockVersionId,
    ],
    [validBody, "invalid-id", mockVersionId],
    [validBody, mockEserviceId, "invalid-version-id"],
  ])(
    "should return 400 if invalid payload or params are passed (case %#)",
    async (body, eServiceId, versionId) => {
      const res = await makeRequest(
        eServiceId,
        versionId,
        body as ApiSaveEservicePayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
