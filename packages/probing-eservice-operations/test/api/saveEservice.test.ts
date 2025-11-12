import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import {
  genericError,
  EserviceInteropState,
  EserviceTechnology,
} from "pagopa-interop-probing-models";
import { eServiceByVersionIdNotFound } from "../../src/model/domain/errors.js";
import { ApiSaveEservicePayload } from "pagopa-interop-probing-eservice-operations-client";

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
    audience: ["pagopa.it"],
  };

  eServiceService.saveEservice = vi.fn().mockResolvedValue({});

  const makeRequest = async (
    eServiceId: string = mockEserviceId,
    versionId: string = mockVersionId,
    body: ApiSaveEservicePayload = validBody,
  ) =>
    request(api)
      .post(`/eservices/${eServiceId}/versions/${versionId}/saveEservice`)
      .set("X-Correlation-Id", uuidv4())
      .send(body);

  it("should return 204 when save succeeds", async () => {
    const res = await makeRequest();
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

      const res = await makeRequest();
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
      body: {
        name: "Partial service",
        producerId: uuidv4(),
      },
    },
    {
      eServiceId: mockEserviceId,
      versionId: mockVersionId,
      body: {
        ...validBody,
        technology: "INVALID_TECHNOLOGY",
      },
    },
    {
      eServiceId: mockEserviceId,
      versionId: mockVersionId,
      body: {
        ...validBody,
        state: "INVALID_STATE",
      },
    },
    {
      eServiceId: mockEserviceId,
      versionId: mockVersionId,
      body: {
        ...validBody,
        versionNumber: -1,
      },
    },
    {
      eServiceId: mockEserviceId,
      versionId: mockVersionId,
      body: {
        ...validBody,
        versionNumber: "invalid-version-number",
      },
    },
    {
      eServiceId: "invalid-id",
      versionId: mockVersionId,
      body: validBody,
    },
    {
      eServiceId: mockEserviceId,
      versionId: "invalid-version-id",
      body: validBody,
    },
  ])(
    "should return 400 if invalid payload or params are provided: %s",
    async ({ eServiceId, versionId, body }) => {
      const res = await makeRequest(
        eServiceId,
        versionId,
        body as ApiSaveEservicePayload,
      );
      expect(res.status).toBe(400);
    },
  );
});
