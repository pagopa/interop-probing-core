import { Request } from "express";
import { P, match } from "ts-pattern";
import { z } from "zod";

export const Headers = z.object({
  "X-Correlation-Id": z.string(),
});

export type Headers = z.infer<typeof Headers>;

export const probingCorrelationIdToHeader = (
  req: Request,
): string | undefined =>
  match(req.headers)
    .with(
      { "x-correlation-id": P.string },
      (headers) => headers["x-correlation-id"],
    )
    .otherwise(() => undefined);
