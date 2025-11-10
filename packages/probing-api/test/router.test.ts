import { afterEach, describe, expect, it, vi } from "vitest";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import {
  contextMiddleware,
  ExpressContext,
  genericLogger,
  zodiosCtx,
} from "pagopa-interop-probing-commons";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  EServiceContent,
  EServiceMainData,
  EServiceProbingData,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
} from "pagopa-interop-probing-models";
import eServiceRouter from "../src/routers/eserviceRouter.js";
import { config } from "../src/utilities/config.js";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceNotFound,
  eServiceProbingDataByRecordIdNotFound,
  makeApiProblem,
} from "../src/model/domain/errors.js";
import { errorMapper } from "../src/utilities/errorMapper.js";
import {
  ApiGetEserviceMainDataResponse,
  ApiSearchEservicesResponse,
  ApiGetProducersResponse,
  ApiUpdateEserviceFrequencyPayload,
  ApiUpdateEserviceProbingStatePayload,
  ApiUpdateEserviceStatePayload,
  ApiSearchEservicesQuery,
  ApiGetProducersQuery,
  Api,
} from "../src/model/types.js";
import { mockOperationsApiClientError, nowDateUTC } from "./utils.js";
import { ZodiosApp } from "@zodios/express";

const operationsApiClient = createApiClient(config.operationsBaseUrl);

const app: ZodiosApp<Api, ExpressContext> = zodiosCtx.app();
app.use(contextMiddleware(config.applicationName));
app.use(eServiceRouter(zodiosCtx)(operationsApiClient));

const probingApiClient = supertest(app);

describe("eService Router", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("e-service state gets updated", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const eserviceUpdateState: ApiUpdateEserviceStatePayload = {
      eServiceState: "ACTIVE",
    };

    vi.spyOn(operationsApiClient, "updateEserviceState").mockResolvedValue(
      undefined,
    );

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateState`,
      )
      .set("Content-Type", "application/json")
      .send(eserviceUpdateState);

    expect(response.status).toBe(204);
  });

  it("e-service state can't be updated because e-service does not exist", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const eserviceUpdateState: ApiUpdateEserviceStatePayload = {
      eServiceState: "ACTIVE",
    };
    const errorRes = makeApiProblem(
      eServiceNotFound(params.eserviceId, params.versionId),
      errorMapper,
      genericLogger,
    );
    const apiClientError = mockOperationsApiClientError(errorRes);

    vi.spyOn(operationsApiClient, "updateEserviceState").mockRejectedValue(
      apiClientError,
    );

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateState`,
      )
      .set("Content-Type", "application/json")
      .send(eserviceUpdateState);

    expect(response.text).contains(params.eserviceId);
    expect(response.text).contains(params.versionId);
    expect(response.status).toBe(404);
  });

  it("e-service state can't be updated because e-service id request parameter is missing", async () => {
    const params = {
      versionId: uuidv4(),
    };
    const eserviceUpdateState: ApiUpdateEserviceStatePayload = {
      eServiceState: "ACTIVE",
    };

    const response = await probingApiClient
      .post(`/eservices/versions/${params.versionId}/updateState`)
      .set("Content-Type", "application/json")
      .send(eserviceUpdateState);

    expect(response.text).contains(
      `Cannot POST /eservices/versions/${params.versionId}/updateState`,
    );
    expect(response.status).toBe(404);
  });

  it("e-service state can't be updated because e-service version id request parameter is missing", async () => {
    const params = {
      eserviceId: uuidv4(),
    };
    const eserviceUpdateState: ApiUpdateEserviceStatePayload = {
      eServiceState: "ACTIVE",
    };

    const response = await probingApiClient
      .post(`/eservices/${params.eserviceId}/versions/updateState`)
      .set("Content-Type", "application/json")
      .send(eserviceUpdateState);

    expect(response.text).contains(
      `Cannot POST /eservices/${params.eserviceId}/versions/updateState`,
    );
    expect(response.status).toBe(404);
  });

  it("e-service state can't be updated because request body eServiceState is missing", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateState`,
      )
      .set("Content-Type", "application/json");

    expect(response.text).toContain("Bad request");
    expect(response.text).toContain("body");
    expect(response.text).toContain("Required");
    expect(response.text).toContain("eServiceState");
    expect(response.status).toBe(400);
  });

  it("e-service probing state gets updated", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const updateEserviceProbingState: ApiUpdateEserviceProbingStatePayload = {
      probingEnabled: true,
    };

    vi.spyOn(
      operationsApiClient,
      "updateEserviceProbingState",
    ).mockResolvedValue(undefined);

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/probing/updateState`,
      )
      .set("Content-Type", "application/json")
      .send(updateEserviceProbingState);

    expect(response.status).toBe(204);
  });

  it("e-service probing state can't be updated because e-service does not exist", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const updateEserviceProbingState: ApiUpdateEserviceProbingStatePayload = {
      probingEnabled: true,
    };

    const errorRes = makeApiProblem(
      eServiceNotFound(params.eserviceId, params.versionId),
      errorMapper,
      genericLogger,
    );
    const apiClientError = mockOperationsApiClientError(errorRes);

    vi.spyOn(
      operationsApiClient,
      "updateEserviceProbingState",
    ).mockRejectedValue(apiClientError);

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/probing/updateState`,
      )
      .set("Content-Type", "application/json")
      .send(updateEserviceProbingState);

    expect(response.text).contains(params.eserviceId);
    expect(response.text).contains(params.versionId);
    expect(response.status).toBe(404);
  });

  it("e-service state can't be updated because request body probingEnabled is missing", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/probing/updateState`,
      )
      .set("Content-Type", "application/json");

    expect(response.text).toContain("Bad request");
    expect(response.text).toContain("body");
    expect(response.text).toContain("Required");
    expect(response.text).toContain("probingEnabled");
    expect(response.status).toBe(400);
  });

  it("e-service frequency, polling stard date and end date get updated", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const updateEserviceFrequency: ApiUpdateEserviceFrequencyPayload = {
      startTime: nowDateUTC(0, 0, 0),
      endTime: nowDateUTC(23, 59, 0),
      frequency: 5,
    };

    vi.spyOn(operationsApiClient, "updateEserviceFrequency").mockResolvedValue(
      undefined,
    );

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateFrequency`,
      )
      .set("Content-Type", "application/json")
      .send(updateEserviceFrequency);

    expect(response.status).toBe(204);
  });

  it("e-service frequency can't be updated because e-service does not exist", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const updateEserviceFrequency: ApiUpdateEserviceFrequencyPayload = {
      startTime: nowDateUTC(0, 0, 0),
      endTime: nowDateUTC(23, 59, 0),
      frequency: 5,
    };

    const errorRes = makeApiProblem(
      eServiceNotFound(params.eserviceId, params.versionId),
      errorMapper,
      genericLogger,
    );
    const apiClientError = mockOperationsApiClientError(errorRes);

    vi.spyOn(operationsApiClient, "updateEserviceFrequency").mockRejectedValue(
      apiClientError,
    );

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateFrequency`,
      )
      .set("Content-Type", "application/json")
      .send(updateEserviceFrequency);

    expect(response.text).contains(params.eserviceId);
    expect(response.text).contains(params.versionId);
    expect(response.status).toBe(404);
  });

  it("e-service frequency can't be updated because e-service id request parameter is missing", async () => {
    const params = {
      versionId: uuidv4(),
    };

    const response = await probingApiClient
      .post(`/eservices/versions/${params.versionId}/updateFrequency`)
      .set("Content-Type", "application/json");

    expect(response.text).contains(
      `Cannot POST /eservices/versions/${params.versionId}/updateFrequency`,
    );
    expect(response.status).toBe(404);
  });

  it("e-service frequency can't be updated because e-service version id request parameter is missing", async () => {
    const params = {
      eserviceId: uuidv4(),
    };

    const response = await probingApiClient
      .post(`/eservices/${params.eserviceId}/versions/updateFrequency`)
      .set("Content-Type", "application/json");

    expect(response.text).contains(
      `Cannot POST /eservices/${params.eserviceId}/versions/updateFrequency`,
    );
    expect(response.status).toBe(404);
  });

  it("e-service frequency can't be updated because request body is missing required fields", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };

    const response = await probingApiClient
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateFrequency`,
      )
      .set("Content-Type", "application/json");

    expect(response.text).toContain("Bad request");
    expect(response.text).toContain("body");
    expect(response.text).toContain("Required");
    expect(response.text).toContain("startTime");
    expect(response.text).toContain("endTime");
    expect(response.status).toBe(400);
  });

  it("the list of e-services has been retrieved", async () => {
    const searchEservices: ApiSearchEservicesQuery = {
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      state: [eserviceMonitorState.online, eserviceMonitorState["n_d"]],
      offset: 0,
      limit: 2,
    };

    const eservice: EServiceContent = {
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      eserviceRecordId: 1,
      responseReceived: new Date().toISOString(),
      state: eserviceInteropState.inactive,
      lastRequest: "2024-02-22T12:00:00Z",
      responseStatus: responseStatus.ok,
      basePath: ["path"],
      technology: "REST",
      pollingFrequency: 60,
      probingEnabled: true,
      audience: ["audience"],
    };

    vi.spyOn(operationsApiClient, "searchEservices").mockResolvedValue({
      content: [eservice],
      totalElements: 0,
      offset: 0,
      limit: 2,
    });

    const response = await probingApiClient
      .get(`/eservices`)
      .set("Content-Type", "application/json")
      .query(searchEservices);

    expect(response.status).toBe(200);
  });

  it("the retrieved list of e-services is empty", async () => {
    const searchEservices: ApiSearchEservicesQuery = {
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      state: [eserviceMonitorState.online, eserviceMonitorState.offline],
      offset: 0,
      limit: 2,
    };

    vi.spyOn(operationsApiClient, "searchEservices").mockResolvedValue({
      content: [],
      totalElements: 0,
      offset: 0,
      limit: 2,
    } satisfies ApiSearchEservicesResponse);

    const response = await probingApiClient
      .get(`/eservices`)
      .set("Content-Type", "application/json")
      .query(searchEservices);
    expect(response.status).toBe(200);
  });

  it("bad request exception is thrown because size request parameter is missing", async () => {
    const searchEservices: ApiSearchEservicesQuery = {
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      offset: 0,
      limit: 1,
    };

    const { eserviceName, producerName, versionNumber, offset } =
      searchEservices;

    const response = await probingApiClient
      .get(`/eservices`)
      .set("Content-Type", "application/json")
      .query({
        eserviceName,
        producerName,
        versionNumber,
        offset,
      });

    expect(response.text).toContain("Bad request");
    expect(response.text).toContain("query.limit");
    expect(response.text).toContain("Required");
    expect(response.status).toBe(400);
  });

  it("bad request exception is thrown because pageNumber request parameter is missing", async () => {
    const searchEservices: ApiSearchEservicesQuery = {
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      offset: 0,
      limit: 1,
    };

    const { eserviceName, producerName, versionNumber, limit } =
      searchEservices;

    const response = await probingApiClient
      .get(`/eservices`)
      .set("Content-Type", "application/json")
      .query({
        eserviceName,
        producerName,
        versionNumber,
        limit,
      });

    expect(response.text).toContain("Bad request");
    expect(response.text).toContain("query.offset");
    expect(response.text).toContain("Required");
    expect(response.status).toBe(400);
  });

  it("e-service main data cant be retrieved because e-service does not exist", async () => {
    const eserviceRecordId: number = 1;

    const errorRes = makeApiProblem(
      eServiceMainDataByRecordIdNotFound(eserviceRecordId),
      errorMapper,
      genericLogger,
    );
    const apiClientError = mockOperationsApiClientError(errorRes);

    vi.spyOn(operationsApiClient, "getEserviceMainData").mockRejectedValue(
      apiClientError,
    );

    const response = await probingApiClient
      .get(`/eservices/mainData/${eserviceRecordId}`)
      .set("Content-Type", "application/json");

    expect(response.text).contains(eserviceRecordId);
    expect(response.status).toBe(404);
  });

  it("e-service main data are retrieved successfully", async () => {
    const eserviceRecordId: number = 1;
    const eserviceMainData: EServiceMainData = {
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      eserviceId: uuidv4(),
      versionId: uuidv4(),
      pollingFrequency: 5,
    };

    vi.spyOn(operationsApiClient, "getEserviceMainData").mockResolvedValue(
      eserviceMainData,
    );

    const {
      body,
      status,
    }: { body: ApiGetEserviceMainDataResponse; status: number } =
      await probingApiClient
        .get(`/eservices/mainData/${eserviceRecordId}`)
        .set("Content-Type", "application/json");

    expect(body).to.have.property("eserviceName");
    expect(status).toBe(200);
  });

  it("e-service probing data cant be retrieved because e-service does not exist", async () => {
    const eserviceRecordId: number = 1;

    const errorRes = makeApiProblem(
      eServiceProbingDataByRecordIdNotFound(eserviceRecordId),
      errorMapper,
      genericLogger,
    );
    const apiClientError = mockOperationsApiClientError(errorRes);

    vi.spyOn(operationsApiClient, "getEserviceProbingData").mockRejectedValue(
      apiClientError,
    );

    const response = await probingApiClient
      .get(`/eservices/probingData/${eserviceRecordId}`)
      .set("Content-Type", "application/json");

    expect(response.text).contains(eserviceRecordId);
    expect(response.status).toBe(404);
  });

  it("e-service main data are retrieved successfully", async () => {
    const eserviceRecordId: number = 1;
    const eserviceMainData: EServiceProbingData = {
      state: eserviceInteropState.inactive,
      probingEnabled: true,
      pollingFrequency: 5,
      lastRequest: new Date().toISOString(),
      responseReceived: new Date().toISOString(),
      responseStatus: responseStatus.ok,
    };

    vi.spyOn(operationsApiClient, "getEserviceProbingData").mockResolvedValue(
      eserviceMainData,
    );

    const {
      body,
      status,
    }: { body: ApiGetEserviceMainDataResponse; status: number } =
      await probingApiClient
        .get(`/eservices/probingData/${eserviceRecordId}`)
        .set("Content-Type", "application/json");

    expect(body).to.have.property("probingEnabled");
    expect(body).to.have.property("state");
    expect(body).to.have.property("eserviceActive");
    expect(status).toBe(200);
  });

  it("given a valid producer name, then returns a non-empty list", async () => {
    const eservicesProducers: ApiGetProducersQuery = {
      producerName: "eService producer 001",
      offset: 0,
      limit: 2,
    };

    vi.spyOn(operationsApiClient, "getEservicesProducers").mockResolvedValue({
      content: ["eService producer 001"],
    });

    const { body, status }: { body: ApiGetProducersResponse; status: number } =
      await probingApiClient
        .get(`/producers`)
        .set("Content-Type", "application/json")
        .query(eservicesProducers);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(status).toBe(200);
  });

  it("given a valid producer name with no matching records, then returns an empty list", async () => {
    const eservicesProducers: ApiGetProducersQuery = {
      producerName: "eService producer 001",
      offset: 0,
      limit: 2,
    };

    vi.spyOn(operationsApiClient, "getEservicesProducers").mockResolvedValue({
      content: [],
    });

    const { body, status }: { body: ApiGetProducersResponse; status: number } =
      await probingApiClient
        .get(`/producers`)
        .set("Content-Type", "application/json")
        .query(eservicesProducers);

    expect(body).toEqual(expect.arrayContaining([]));
    expect(status).toBe(200);
  });
});
