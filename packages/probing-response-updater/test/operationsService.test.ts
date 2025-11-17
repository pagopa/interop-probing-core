import { afterAll, describe, expect, it, vi } from "vitest";
import { responseStatus } from "pagopa-interop-probing-models";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { config } from "./../src/utilities/config.js";
import { mockApiClientError } from "pagopa-interop-probing-commons-test";
import { v4 as uuidv4 } from "uuid";
import { WithSQSMessageId, AppContext } from "pagopa-interop-probing-commons";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("eService service test", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should update responseReceived without throwing", async () => {
    const eserviceRecordId = 1;
    const status = responseStatus.ok;
    const responseReceived = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000,
    ).toISOString();

    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: "MESSAGE_ID",
      correlationId: uuidv4(),
    };

    vi.spyOn(apiClient, "updateEserviceResponseReceived").mockResolvedValue(
      undefined,
    );

    await expect(
      operationsService.updateResponseReceived(
        eserviceRecordId,
        { status, responseReceived },
        ctx,
      ),
    ).resolves.not.toThrow();
  });

  it("should throw apiUpdateResponseReceivedError with status 500", async () => {
    const eserviceRecordId = 1;
    const status = responseStatus.ok;
    const responseReceived = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000,
    ).toISOString();

    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: "MESSAGE_ID",
      correlationId: uuidv4(),
    };

    const apiClientError = mockApiClientError(500, "Internal server error");

    vi.spyOn(apiClient, "updateEserviceResponseReceived").mockRejectedValueOnce(
      apiClientError,
    );

    await expect(
      operationsService.updateResponseReceived(
        eserviceRecordId,
        { status, responseReceived },
        ctx,
      ),
    ).rejects.toMatchObject({
      status: 500,
      code: "apiUpdateResponseReceivedError",
    });
  });
});
