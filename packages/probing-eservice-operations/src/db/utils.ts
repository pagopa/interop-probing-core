import pg from "pg";
import { DbConfig } from "../utilities/dbConfig.js";
import { DrizzleReturnType } from "./types.js";
import { drizzle } from "drizzle-orm/node-postgres";

export const makeDrizzleConnection = (
  dbConfig: DbConfig,
): DrizzleReturnType => {
  const pool = new pg.Pool({
    host: dbConfig.dbHost,
    port: dbConfig.dbPort,
    database: dbConfig.dbName,
    user: dbConfig.dbUsername,
    password: dbConfig.dbPassword,
    ssl: dbConfig.dbUseSSL ? { rejectUnauthorized: false } : undefined,
  });
  return drizzle({ client: pool });
};
