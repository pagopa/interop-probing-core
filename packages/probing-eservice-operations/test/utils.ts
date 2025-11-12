import {
  EServiceSQL,
  TenantSQL,
  EserviceProbingRequestSQL,
  EserviceProbingResponseSQL,
  EserviceViewSQL,
} from "../src/db/types.js";
import {
  eservicesInProbing,
  eserviceProbingRequestsInProbing,
  eserviceProbingResponsesInProbing,
  eserviceViewInProbing,
  tenantsInProbing,
} from "../src/db/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { DBService, dbServiceBuilder } from "../src/services/dbService.js";
import {
  TenantService,
  tenantServiceBuilder,
} from "../src/services/tenantService.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "../src/services/eserviceService.js";
import { afterEach, inject } from "vitest";
import { setupTestContainersVitest } from "./utilsSetupTestContainers.js";

type EserviceInsert = Omit<EServiceSQL, "id">;
type TenantInsert = Omit<TenantSQL, "id">;
type EserviceProbingRequestInsert = Pick<
  EserviceProbingRequestSQL,
  "eservicesRecordId" | "lastRequest"
>;
type EserviceProbingResponseInsert = Pick<
  EserviceProbingResponseSQL,
  "eservicesRecordId" | "responseReceived" | "status"
>;

export const { cleanup, postgresDB: db } = await setupTestContainersVitest(
  inject("dbConfig"),
);

afterEach(cleanup);

export const dbService: DBService = dbServiceBuilder(db);
export const tenantService: TenantService = tenantServiceBuilder(dbService);
export const eserviceService: EserviceService =
  eServiceServiceBuilder(dbService);

export const addEserviceProbingRequest = async (
  data: EserviceProbingRequestInsert,
) => {
  await db
    .insert(eserviceProbingRequestsInProbing)
    .values({
      eservicesRecordId: data.eservicesRecordId,
      lastRequest: data.lastRequest,
    })
    .onConflictDoUpdate({
      target: eserviceProbingRequestsInProbing.eservicesRecordId,
      set: { lastRequest: data.lastRequest },
    });
};

export const addEserviceProbingResponse = async (
  data: EserviceProbingResponseInsert,
) => {
  await db
    .insert(eserviceProbingResponsesInProbing)
    .values({
      eservicesRecordId: data.eservicesRecordId,
      responseReceived: data.responseReceived,
      status: data.status,
    })
    .onConflictDoUpdate({
      target: eserviceProbingResponsesInProbing.eservicesRecordId,
      set: { responseReceived: data.responseReceived, status: data.status },
    });
};

export const addEservice = async (data: EserviceInsert): Promise<number> => {
  const insertData: EserviceInsert = {
    ...data,
  };

  const [eservice] = await db
    .insert(eservicesInProbing)
    .values(insertData)
    .returning({ id: eservicesInProbing.id });

  return Number(eservice.id);
};

export const addTenant = async (
  data: TenantInsert,
): Promise<TenantInsert & { id?: number | bigint }> => {
  const [tenant] = await db
    .insert(tenantsInProbing)
    .values({
      tenantId: data.tenantId,
      tenantName: data.tenantName,
    })
    .returning();

  return tenant;
};

export const getEservice = async (
  eserviceRecordId: number,
): Promise<EserviceViewSQL> => {
  const [eservice] = await db
    .select()
    .from(eserviceViewInProbing)
    .where(eq(eserviceViewInProbing.id, eserviceRecordId))
    .limit(1);

  return eservice;
};
