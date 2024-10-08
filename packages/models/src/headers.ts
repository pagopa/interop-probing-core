import { z } from "zod";

export const CorrelationIdHeader = z.object({
  "x-correlation-id": z.string(),
});
export type CorrelationIdHeader = z.infer<typeof CorrelationIdHeader>;

export const correlationIdToHeader = (
  correlationId: string,
): CorrelationIdHeader => ({
  "x-correlation-id": correlationId,
});