import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set in environment");
    }
    const sql = postgres(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 as connected`;
    console.log("Connection successful:", result);
    await sql.end();
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

testConnection();
