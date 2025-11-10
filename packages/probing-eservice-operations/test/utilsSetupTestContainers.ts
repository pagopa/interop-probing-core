import { sql } from "drizzle-orm";
import { DrizzleReturnType } from "../src/db/types.js";
import { makeDrizzleConnection } from "../src/db/utils.js";
import { DbConfig } from "../src/utilities/dbConfig.js";
import { eservicesInProbing, tenantsInProbing } from "../src/db/index.js";

export async function setupTestContainersVitest(dbConfig: DbConfig): Promise<{
  postgresDB: DrizzleReturnType;
  cleanup: () => Promise<void>;
}> {
  const postgresDB = makeDrizzleConnection(dbConfig);

  return {
    postgresDB,
    cleanup: async (): Promise<void> => {
      await postgresDB.delete(tenantsInProbing).where(sql`TRUE`);
      await postgresDB.delete(eservicesInProbing).where(sql`TRUE`);
    },
  };
}
