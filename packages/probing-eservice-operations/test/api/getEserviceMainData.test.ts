import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { api, eServiceService } from "../vitest.api.setup.js";
import { v4 as uuidv4 } from "uuid";
import { genericError } from "pagopa-interop-probing-models";
import { eServiceByRecordIdNotFound } from "../../src/model/domain/errors.js";
import { ApiGetEserviceMainDataResponse } from "pagopa-interop-probing-eservice-operations-client";

describe("get /eservices/mainData/{eserviceRecordId} router test", () => {
  const mockEserviceRecordId = 123;

  const mockResponse: ApiGetEserviceMainDataResponse = {
    eserviceName: "eService",
    versionNumber: 2,
    producerName: "PagoPA",
    pollingFrequency: 15,
    versionId: uuidv4(),
    eserviceId: uuidv4(),
  };

  eServiceService.getEserviceMainData = vi.fn().mockResolvedValue(mockResponse);

  const makeRequest = async (id: number = mockEserviceRecordId) =>
    request(api)
      .get(`/eservices/mainData/${id}`)
      .set("X-Correlation-Id", uuidv4());

  it("should return 200 and eservice main data when succeeds", async () => {
    const res = await makeRequest();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
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
    "should return $expectedStatus when $error.code occurs",
    async ({ error, expectedStatus }) => {
      eServiceService.getEserviceMainData = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([NaN, -5, "invalid-id"])(
    "should return 400 if invalid eserviceRecordId: %s",
    async (invalidId) => {
      const res = await makeRequest(invalidId as unknown as number);
      expect(res.status).toBe(400);
    },
  );
});
