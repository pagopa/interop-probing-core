import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, eServiceService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import { eServiceNotFound } from "../../src/model/domain/errors.js";

describe("delete /eservices/{eServiceId}/deleteEservice router test", () => {
  const mockEserviceId = uuidv4();

  eServiceService.deleteEservice = vi.fn().mockResolvedValue({});

  const makeRequest = async (eServiceId: string) =>
    request(api)
      .delete(`/eservices/${eServiceId}/deleteEservice`)
      .set("X-Correlation-Id", uuidv4());

  it("should return 204 when deletion succeeds", async () => {
    const res = await makeRequest(mockEserviceId);
    expect(res.status).toBe(204);
  });

  it.each([
    {
      error: eServiceNotFound(mockEserviceId),
      expectedStatus: 404,
    },
    {
      error: genericError("Unexpected error"),
      expectedStatus: 500,
    },
  ])(
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      eServiceService.deleteEservice = vi.fn().mockRejectedValueOnce(error);

      const res = await makeRequest(mockEserviceId);
      expect(res.status).toBe(expectedStatus);
    },
  );

  it("should return 400 if invalid eserviceId is provided", async () => {
    const res = await makeRequest("invalid-id");
    expect(res.status).toBe(400);
  });
});
