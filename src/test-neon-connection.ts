import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT 1 as connected`;
    console.log("Connection successful:", result);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

testConnection();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set in environment");
    }