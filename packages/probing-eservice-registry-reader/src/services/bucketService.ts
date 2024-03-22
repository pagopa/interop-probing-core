import { EserviceDto } from "pagopa-interop-probing-models";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import { z } from "zod";
import { readObjectS3BucketError } from "../model/domain/errors.js";

export const bucketServiceBuilder = (s3Client: S3Client) => {
  return {
    async readObject(): Promise<EserviceDto[]> {
      try {
        const getObjectParams = {
          Bucket: config.bucketS3Name,
          Key: config.bucketS3Key,
        };

        const s3Object = await s3Client.send(
          new GetObjectCommand(getObjectParams)
        );

        const data = JSON.parse(
          (await streamToBuffer(s3Object.Body)).toString()
        );

        const result = z
          .array(EserviceDto)
          .safeParse(data.map((d: EserviceDto) => d));

        if (!result.success) {
          logger.error(
            `Unable to parse eservices from S3 Bucket ${
              config.bucketS3Name
            } Key ${config.bucketS3Key}: result ${JSON.stringify(
              result
            )} - data ${JSON.stringify(data)} `
          );

          throw new Error(
            `Unable to parse eservices from S3 Bucket ${config.bucketS3Name} Key ${config.bucketS3Key}`
          );
        }

        return result.data;
      } catch (error: unknown) {
        throw readObjectS3BucketError(error);
      }
    },
  };
};

export type BucketService = ReturnType<typeof bucketServiceBuilder>;

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
