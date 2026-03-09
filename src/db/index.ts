import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set in environment");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } as any });

export const db = drizzle(sql);

export default db;
