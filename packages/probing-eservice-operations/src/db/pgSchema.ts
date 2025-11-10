import { pgSchema } from "drizzle-orm/pg-core";
import { DbConfig } from "../utilities/dbConfig.js";

const config = DbConfig.parse(process.env);
export const db = pgSchema(config.dbSchema);
