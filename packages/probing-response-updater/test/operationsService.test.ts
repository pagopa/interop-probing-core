import { afterAll, describe, expect, it, vi } from "vitest";
import {
  ApplicationError,
  responseStatus,
} from "pagopa-interop-probing-models";
import { createApiClient } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../src/services/operationsService.js";
import { config } from "./../src/utilities/config.js";
import { mockApiClientError } from "./utils.js";
import { v4 as uuidv4 } from "uuid";
import { WithSQSMessageId, AppContext } from "pagopa-interop-probing-commons";
import { ErrorCodes } from "../src/model/domain/errors.js";

const apiClient = createApiClient(config.operationsBaseUrl);

describe("eService service test", () => {
  const operationsService: OperationsService =
    operationsServiceBuilder(apiClient);

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("finding the e-service identified by eserviceRecordId, response received is successfully updated", async () => {
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

    vi.spyOn(apiClient, "updateResponseReceived").mockResolvedValue(undefined);

    await expect(
      async () =>
        await operationsService.updateResponseReceived(
          {
            params: { eserviceRecordId },
            payload: {
              status,
              responseReceived,
            },
          },
          ctx,
        ),
    ).not.toThrowError();
  });

  it("finding the e-service identified by eserviceRecordId, an exception apiUpdateResponseReceivedError should be thrown with status 500", async () => {
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

    vi.spyOn(apiClient, "updateResponseReceived").mockRejectedValueOnce(
      apiClientError,
    );

    try {
      await operationsService.updateResponseReceived(
        {
          params: { eserviceRecordId },
          payload: {
            status,
            responseReceived,
          },
        },
        ctx,
      );
    } catch (error) {
      console.log("error", error);
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).status).toBe(500);
    }
  });

  it("finding the e-service identified by eserviceRecordId, an exception apiUpdateResponseReceivedError should be thrown with failed Zodios validation", async () => {
    const eserviceRecordId = 1;
    const status = responseStatus.ok;
    const responseReceived = "2023-04-06";
    const ctx: WithSQSMessageId<AppContext> = {
      serviceName: config.applicationName,
      messageId: "MESSAGE_ID",
      correlationId: uuidv4(),
    };

    try {
      await operationsService.updateResponseReceived(
        {
          params: { eserviceRecordId },
          payload: {
            status,
            responseReceived,
          },
        },
        ctx,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0001");
    }
  });
});
