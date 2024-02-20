import { afterAll, describe, expect, it, vi } from "vitest";
import { zodiosCtx } from "pagopa-interop-probing-commons";
import eServiceRouter from "../src/routers/eserviceRouter.js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import { createApiClient as createOperationsApiClient } from "../../probing-eservice-operations/src/model/generated/api.js";
import { config } from "../src/utilities/config.js";
import { mockOperationsApiClientError } from "./utils.js";
import {
  eServiceNotFound,
  makeApiProblem,
} from "../src/model/domain/errors.js";
import { updateEServiceErrorMapper } from "../src/utilities/errorMappers.js";

const operationsApiClient = createOperationsApiClient(config.operationsBaseUrl);
const app = zodiosCtx.app();
app.use(eServiceRouter(zodiosCtx)(operationsApiClient));
const request = supertest(app);

describe("eService Router", () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("e-service state can't be updated because e-service does not exist", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const eserviceUpdateState = {
      eServiceState: "ACTIVE",
    };
    const errorRes = makeApiProblem(
      eServiceNotFound(params.eserviceId, params.versionId),
      updateEServiceErrorMapper
    );
    const apiClientError = mockOperationsApiClientError(errorRes);

    vi.spyOn(operationsApiClient, "updateEserviceState").mockRejectedValue(
      apiClientError
    );

    const response = await request
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateState`
      )
      .set("Content-Type", "application/json")
      .send(eserviceUpdateState);

    expect(response.text).contains(params.eserviceId);
    expect(response.text).contains(params.versionId);
    expect(response.status).toBe(404);
  });

  it("e-service state gets updated", async () => {
    const params = {
      eserviceId: uuidv4(),
      versionId: uuidv4(),
    };
    const eserviceUpdateState = {
      eServiceState: "ACTIVE",
    };

    vi.spyOn(operationsApiClient, "updateEserviceState").mockResolvedValue(
      undefined
    );

    const response = await request
      .post(
        `/eservices/${params.eserviceId}/versions/${params.versionId}/updateState`
      )
      .set("Content-Type", "application/json")
      .send(eserviceUpdateState);

    expect(response.status).toBe(204);
  });
});
