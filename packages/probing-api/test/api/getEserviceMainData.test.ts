import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { api, operationsService } from "../vitest.api.setup.js";
import { genericError } from "pagopa-interop-probing-models";
import { ProbingApiGetEserviceMainDataResponse } from "../../src/model/types.js";
import { eServiceByRecordIdNotFound } from "../../src/model/domain/errors.js";

describe("get /eservices/mainData/{eserviceRecordId} router test", () => {
  const mockEserviceRecordId = 123;
  const mockEserviceId = uuidv4();
  const mockVersionId = uuidv4();

  const mockResponse: ProbingApiGetEserviceMainDataResponse = {
    eserviceName: "eService",
    versionNumber: 1,
    producerName: "PagoPA",
    pollingFrequency: 15,
    versionId: mockVersionId,
    eserviceId: mockEserviceId,
  };

  operationsService.getEserviceMainData = vi
    .fn()
    .mockResolvedValue(mockResponse);

  const makeRequest = async (id: unknown = mockEserviceRecordId) =>
    request(api)
      .get(`/eservices/mainData/${id}`)
      .set("X-Correlation-Id", uuidv4());

  it("should return 200 when retrieval succeeds", async () => {
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
    "should return $expectedStatus for $error.code",
    async ({ error, expectedStatus }) => {
      operationsService.getEserviceMainData = vi
        .fn()
        .mockRejectedValueOnce(error);

      const res = await makeRequest();
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each([
    { eserviceRecordId: "invalid-id" },
    { eserviceRecordId: -1 },
    { eserviceRecordId: null },
  ])(
    "should return 400 if invalid path param is provided: %s",
    async ({ eserviceRecordId }) => {
      const res = await makeRequest(eserviceRecordId);
      expect(res.status).toBe(400);
    },
  );
});
