import { EserviceMonitorState } from "pagopa-interop-probing-models";
import { z } from "zod";

export const ApiEServiceContent = z.object({
    eserviceRecordId: z.number(),
    eserviceName: z.string(),
    producerName: z.string(),
    responseReceived: z.string().datetime({ offset: true }),
    state: EserviceMonitorState,
    versionNumber: z.number(),
  });
  export type ApiEServiceContent = z.infer<typeof ApiEServiceContent>;
  