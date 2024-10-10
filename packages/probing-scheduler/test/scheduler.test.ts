import { describe, expect, it, vi, afterAll, beforeAll } from "vitest";
import { processTask } from "../src/processTask.js";
import { ApiGetEservicesReadyForPollingQuery } from "pagopa-interop-probing-eservice-operations-client";
import { config } from "../src/utilities/config.js";
import {
  ApplicationError,
  correlationIdToHeader,
  EserviceContentDto,
} from "pagopa-interop-probing-models";
import { mockApiClientError } from "./utils.js";
import {
  ErrorCodes,
  apiGetEservicesReadyForPollingError,
  makeApplicationError,
} from "../src/model/domain/errors.js";
import { AppContext, genericLogger } from "pagopa-interop-probing-commons";

const mockUUID: string = "mocked-uuid-value";

describe("Process task test", async () => {
  const totalElements: number = 4;
  const mockEservicesActive: EserviceContentDto[] = [
    {
      eserviceRecordId: 1,
      technology: "REST",
      basePath: ["path1"],
      audience: ["aud1"],
    },
  ];

  const mockOperationsService = {
    getEservicesReadyForPolling: vi.fn().mockResolvedValue({
      content: mockEservicesActive,
      totalElements,
    }),
    updateLastRequest: vi.fn().mockResolvedValue(undefined),
  };

  const mockProducerService = {
    sendToCallerQueue: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(() => {
    vi.mock("uuid", () => ({
      v4: vi.fn(() => mockUUID),
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("Get eservices by calling getEservicesReadyForPolling API, update each eservice by calling updateLastRequest API and send message to queue.", async () => {
    config.schedulerLimit = 1;

    const query: ApiGetEservicesReadyForPollingQuery = {
      offset: 0,
      limit: config.schedulerLimit,
    };

    const pollingCtx: AppContext = {
      serviceName: config.applicationName,
      correlationId: mockUUID,
    };

    await processTask(mockOperationsService, mockProducerService);

    for (let polling = 0; polling < totalElements; polling++) {
      const headers = {
        ...correlationIdToHeader(pollingCtx.correlationId),
      };

      await expect(
        mockOperationsService.getEservicesReadyForPolling,
      ).toHaveBeenCalledWith(
        headers,
        { ...query, offset: polling },
        pollingCtx,
      );
    }

    await expect(
      mockOperationsService.getEservicesReadyForPolling,
    ).toHaveBeenCalledTimes(4);

    await expect(mockOperationsService.updateLastRequest).toHaveBeenCalledTimes(
      4,
    );

    await expect(mockProducerService.sendToCallerQueue).toHaveBeenCalledTimes(
      4,
    );

    await expect(mockProducerService.sendToCallerQueue).toHaveBeenCalledWith(
      mockEservicesActive[0],
      pollingCtx,
    );
  });

  it("Invoke processTask should throw an error when getEservicesReadyForPolling returns a response error", async () => {
    const apiClientError = mockApiClientError(500, "Internal server error");
    const operationsClientError = makeApplicationError(
      apiGetEservicesReadyForPollingError(
        `Error API getEservicesReadyForPolling. Details: ${apiClientError}`,
        apiClientError,
      ),
      genericLogger,
    );

    vi.spyOn(
      mockOperationsService,
      "getEservicesReadyForPolling",
    ).mockRejectedValueOnce(operationsClientError);

    try {
      await processTask(mockOperationsService, mockProducerService);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0002");
      expect((error as ApplicationError<ErrorCodes>).status).toBe(500);
    }
  });
});
