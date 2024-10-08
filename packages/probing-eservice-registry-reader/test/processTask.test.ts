import { describe, expect, it, vi, afterEach } from "vitest";
import { processTask } from "../src/processTask.js";
import { mockBucketObject } from "./utils.js";
import {
  ErrorCodes,
  readObjectS3BucketError,
} from "../src/model/domain/errors.js";
import { config } from "../src/utilities/config.js";
import { ApplicationError } from "pagopa-interop-probing-models";

describe("Process task test", async () => {
  const mockBucketService = {
    readObject: vi.fn().mockResolvedValue(mockBucketObject),
  };

  const mockProducerService = {
    sendToServicesQueue: vi.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Invoke processTask should successfully retrieve and send each eservice to the queue", async () => {
    await processTask(mockBucketService, mockProducerService);

    expect(mockProducerService.sendToServicesQueue).toHaveBeenCalledTimes(
      mockBucketObject.length,
    );
  });

  it("Invoke processTask should throw an error code 0001", async () => {
    const mockReadObjectS3BucketError = readObjectS3BucketError(
      `Unable to parse eservices from S3 Bucket ${config.bucketS3Name} Key ${config.bucketS3Key}`,
    );

    vi.spyOn(mockBucketService, "readObject").mockRejectedValueOnce(
      mockReadObjectS3BucketError,
    );

    try {
      await processTask(mockBucketService, mockProducerService);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError<ErrorCodes>).code).toBe("0001");
    }
  });
});
