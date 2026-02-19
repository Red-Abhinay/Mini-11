import { drizzle } from "drizzle-orm/postgres-js";

let _sql: any | null = null;
let _db: any | null = null;

export function getSql() {
  if (_sql) return _sql;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sslOption =
    process.env.DATABASE_SSL === "false" || process.env.DATABASE_SSL === "disable"
      ? false
      : "require";

  // Use node-postgres (pg) pool and provide a simple tagged-template `sql` function.
  // This avoids runtime issues with the 'postgres' package under Next/Turbopack.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString, ssl: sslOption === "require" ? { rejectUnauthorized: false } : false });

  const sqlTag = (strings: TemplateStringsArray, ...values: any[]) => {
    const parts: string[] = [];
    const params: any[] = [];
    for (let i = 0; i < strings.length; i++) {
      parts.push(strings[i]);
      if (i < values.length) {
        params.push(values[i]);
        parts.push(`$${params.length}`);
      }
    }
    const text = parts.join("");
    return pool.query(text, params).then((r: any) => r.rows);
  };

  _sql = sqlTag as any;
  return _sql;
}

export function getDb() {
  if (_db) return _db;
  _db = drizzle(getSql());
  return _db;
}

export default getDb;
