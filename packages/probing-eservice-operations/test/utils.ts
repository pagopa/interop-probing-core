import {
  EServiceSQL,
  TenantSQL,
  EserviceProbingRequestSQL,
  EserviceProbingResponseSQL,
} from "../src/db/types.js";
import {
  eservicesInProbing,
  eserviceProbingRequestsInProbing,
  eserviceProbingResponsesInProbing,
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
import { v4 as uuidv4 } from "uuid";
import { eServiceDefaultValues } from "../src/db/constants/eServices.js";
import {
  eserviceInteropState,
  technology,
} from "pagopa-interop-probing-models";

export const { cleanup, postgresDB: db } = await setupTestContainersVitest(
  inject("dbConfig"),
);

afterEach(cleanup);

export const dbService: DBService = dbServiceBuilder(db);
export const tenantService: TenantService = tenantServiceBuilder(dbService);
export const eserviceService: EserviceService =
  eServiceServiceBuilder(dbService);

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

export const mockEservice = (
  partialEserviceData: Partial<EserviceInsert> = {},
) => ({
  eserviceName: "eService 001",
  producerName: "eService producer 001",
  versionNumber: 1,
  state: eserviceInteropState.inactive,
  basePath: ["path-1"],
  eserviceTechnology: technology.rest,
  audience: ["audience"],
  eserviceId: uuidv4(),
  versionId: uuidv4(),
  ...eServiceDefaultValues,
  ...partialEserviceData,
});

export const addEservice = async (data: EserviceInsert): Promise<number> => {
  const [eservice] = await db
    .insert(eservicesInProbing)
    .values(data)
    .returning({ id: eservicesInProbing.id });
  return Number(eservice.id);
};

export const addEserviceProbingRequest = async (
  data: EserviceProbingRequestInsert,
) => {
  await db
    .insert(eserviceProbingRequestsInProbing)
    .values(data)
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
    .values(data)
    .onConflictDoUpdate({
      target: eserviceProbingResponsesInProbing.eservicesRecordId,
      set: {
        responseReceived: data.responseReceived,
        status: data.status,
      },
    });
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
): Promise<EServiceSQL> => {
  const [eservice] = await db
    .select()
    .from(eservicesInProbing)
    .where(eq(eservicesInProbing.id, BigInt(eserviceRecordId)))
    .limit(1);
  return eservice;
};
