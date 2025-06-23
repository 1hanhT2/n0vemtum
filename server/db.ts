import { drizzle } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { config } from "./config";

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

let sql: NeonQueryFunction<boolean, boolean>;

try {
  sql = neon(config.databaseUrl);
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  throw error;
}

export const db = drizzle(sql, {
  logger: config.isDevelopment,
});

// Test database connection
export async function testDbConnection() {
  try {
    await sql`SELECT 1`;
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}