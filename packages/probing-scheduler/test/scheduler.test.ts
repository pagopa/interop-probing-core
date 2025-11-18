import { describe, expect, it, vi, afterAll, beforeAll } from "vitest";
import { processTask } from "../src/processTask.js";
import { ApiGetEservicesReadyForPollingQuery } from "pagopa-interop-probing-eservice-operations-client";
import { config } from "../src/utilities/config.js";
import {
  correlationIdToHeader,
  EserviceContentDto,
} from "pagopa-interop-probing-models";
import { apiGetEservicesReadyForPollingError } from "../src/model/domain/errors.js";
import { AppContext } from "pagopa-interop-probing-commons";
import { mockApiClientError } from "pagopa-interop-probing-commons-test";

const mockUUID = "mocked-uuid-value";

describe("Process task test", async () => {
  const totalElements = 4;

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

  it("should get e-services, update last request and push each item to the caller queue", async () => {
    config.schedulerLimit = 1;

    const baseQuery: ApiGetEservicesReadyForPollingQuery = {
      offset: 0,
      limit: config.schedulerLimit,
    };

    const ctx: AppContext = {
      serviceName: config.applicationName,
      correlationId: mockUUID,
    };

    await processTask(mockOperationsService, mockProducerService);

    for (let polling = 0; polling < totalElements; polling++) {
      const headers = { ...correlationIdToHeader(ctx.correlationId) };

      expect(
        mockOperationsService.getEservicesReadyForPolling,
      ).toHaveBeenCalledWith(headers, { ...baseQuery, offset: polling }, ctx);
    }

    expect(
      mockOperationsService.getEservicesReadyForPolling,
    ).toHaveBeenCalledTimes(totalElements);

    expect(mockOperationsService.updateLastRequest).toHaveBeenCalledTimes(
      totalElements,
    );

    expect(mockProducerService.sendToCallerQueue).toHaveBeenCalledTimes(
      totalElements,
    );

    expect(mockProducerService.sendToCallerQueue).toHaveBeenCalledWith(
      mockEservicesActive[0],
      ctx,
    );
  });

  it("should throw apiGetEservicesReadyForPollingError when getEservicesReadyForPolling fails", async () => {
    const apiClientError = mockApiClientError(500, "Internal server error");

    vi.spyOn(
      mockOperationsService,
      "getEservicesReadyForPolling",
    ).mockRejectedValueOnce(
      apiGetEservicesReadyForPollingError(apiClientError),
    );

    await expect(
      processTask(mockOperationsService, mockProducerService),
    ).rejects.toMatchObject({
      code: "apiGetEservicesReadyForPollingError",
    });
  });
});
