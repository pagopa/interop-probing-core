import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";

describe("delete /eservices/{eServiceId}/versions/{versionId}/deleteEserviceVersion router test", () => {
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  eServiceService.deleteEserviceVersion = vi.fn().mockResolvedValue({});

  const makeRequest = async (eServiceId: string, versionId: string) =>
    request(api)
      .delete(
        `/eservices/${eServiceId}/versions/${versionId}/deleteEserviceVersion`,
      )
      .set("X-Correlation-Id", uuidv4());

  it("should return 204 when deletion succeeds", async () => {
    const res = await makeRequest(mockEserviceId, mockVersionId);
    expect(res.status).toBe(204);
  });

  it.each([
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      eServiceService.deleteEserviceVersion = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest(mockEserviceId, mockVersionId);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it("should return 400 if invalid eserviceId is provided", async () => {
    const res = await makeRequest("invalid-id", mockVersionId);
    expect(res.status).toBe(400);
  });

  it("should return 400 if invalid versionId is provided", async () => {
    const res = await makeRequest(mockEserviceId, "invalid-id");
    expect(res.status).toBe(400);
  });
});
