import { InferSelectModel } from "drizzle-orm";
import {
  eservicesInProbing,
  tenantsInProbing,
  eserviceProbingRequestsInProbing,
  eserviceProbingResponsesInProbing,
  eserviceViewInProbing,
} from "./drizzle/schema.js";
import { drizzle } from "drizzle-orm/node-postgres";

export type DrizzleReturnType = ReturnType<typeof drizzle>;

export type EserviceViewQueryBuilder = ReturnType<
  ReturnType<DrizzleReturnType["select"]>["from"]
>;

export type EServiceSQL = InferSelectModel<typeof eservicesInProbing>;
export type TenantSQL = InferSelectModel<typeof tenantsInProbing>;
export type EserviceProbingRequestSQL = InferSelectModel<
  typeof eserviceProbingRequestsInProbing
>;
export type EserviceProbingResponseSQL = InferSelectModel<
  typeof eserviceProbingResponsesInProbing
>;
export type EserviceViewSQL = typeof eserviceViewInProbing.$inferSelect;
