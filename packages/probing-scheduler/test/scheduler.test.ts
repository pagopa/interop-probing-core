import { describe, expect, it, vi, afterAll, beforeAll } from "vitest";
import { processTask } from "../src/processTask.js";
import { ApiGetEservicesReadyForPollingQuery } from "pagopa-interop-probing-eservice-operations-client";
import { config } from "../src/utilities/config.js";
import {
  correlationIdToHeader,
  EserviceContentDto,
} from "pagopa-interop-probing-models";
import { mockApiClientError } from "./utils.js";
import {
  AppError,
  apiGetEservicesReadyForPollingError,
  makeApplicationError,
} from "../src/model/domain/errors.js";
import { AppContext } from "pagopa-interop-probing-commons";

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

    const batchCtx: AppContext = {
      serviceName: config.applicationName,
      correlationId: mockUUID,
    };

    await processTask(mockOperationsService, mockProducerService);

    for (let i = 0; i < 4; i++) {
      const headers = {
        ...correlationIdToHeader(batchCtx.correlationId),
      };

      await expect(
        mockOperationsService.getEservicesReadyForPolling,
      ).toHaveBeenCalledWith(headers, { ...query, offset: i });
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
      batchCtx,
    );
  });

  it("Invoke processTask should throw an error when getEservicesReadyForPolling returns a response error", async () => {
    const apiClientError = mockApiClientError(500, "Internal server error");
    const operationsClientError = makeApplicationError(
      apiGetEservicesReadyForPollingError(
        `Error API getEservicesReadyForPolling. Details: ${apiClientError}`,
        apiClientError,
      ),
    );

    vi.spyOn(
      mockOperationsService,
      "getEservicesReadyForPolling",
    ).mockRejectedValueOnce(operationsClientError);

    try {
      await processTask(mockOperationsService, mockProducerService);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("0002");
      expect((error as AppError).status).toBe(500);
    }
  });
});
