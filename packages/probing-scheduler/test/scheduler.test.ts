import { describe, expect, it, vi, afterEach } from "vitest";
import { processTask } from "../src/processTask.js";
import { ApiGetEservicesReadyForPollingQuery } from "pagopa-interop-probing-eservice-operations-client";
import { config } from "../src/utilities/config.js";
import { EserviceContentDto } from "pagopa-interop-probing-models";
import { mockApiClientError } from "./utils.js";
import {
  AppError,
  apiGetEservicesReadyForPollingError,
  makeApplicationError,
} from "../src/model/domain/errors.js";

describe("Process task test", async () => {
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
      totalElements: 4,
    }),
    updateLastRequest: vi.fn().mockResolvedValue(undefined),
  };

  const mockProducerService = {
    sendToCallerQueue: vi.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Get eservices by calling getEservicesReadyForPolling API, update each eservice by calling updateLastRequest API and send message to queue.", async () => {
    config.schedulerLimit = 1;

    const query: ApiGetEservicesReadyForPollingQuery = {
      offset: 0,
      limit: config.schedulerLimit,
    };

    await processTask(mockOperationsService, mockProducerService);

    await expect(
      mockOperationsService.getEservicesReadyForPolling,
    ).toHaveBeenCalledWith(query);

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
