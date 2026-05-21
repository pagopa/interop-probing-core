import "dotenv-flow/config";
import { defineConfig } from "drizzle-kit";
import { DbConfig } from "./src/utilities/dbConfig.js";

const dbConfig = DbConfig.parse(process.env);

export default defineConfig({
  out: "./src/db/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: dbConfig.dbHost,
    port: dbConfig.dbPort,
    user: dbConfig.dbUsername,
    password: dbConfig.dbPassword,
    database: dbConfig.dbName,
    ssl: dbConfig.dbUseSSL,
  },
  schemaFilter: [dbConfig.dbSchema],
});
