import { UpdateResponseReceivedApi } from "../model/models.js";
import { ZodiosInstance } from "@zodios/core";
import { Api } from "../../../probing-eservice-operations/src/model/types.js";

export const eServiceServiceClient = (apiClient: ZodiosInstance<Api>) => {
  return {
    async updateResponseReceived({
      params,
      payload,
    }: UpdateResponseReceivedApi): Promise<void> {
      try {
        await apiClient.updateResponseReceived(
          {
            status: payload.status,
            responseReceived: payload.responseReceived,
          },
          { params: { eserviceRecordId: params.eserviceRecordId } }
        );
      } catch (e: unknown) {
        throw e;
      }
    },
  };
};

export type EserviceService = ReturnType<typeof eServiceServiceClient>;
