const dotenv = require('dotenv');
dotenv.config();

const postgres = require('postgres');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set. Create a .env file with DATABASE_URL.');
  process.exit(1);
}

const sslOption = process.env.DATABASE_SSL === 'false' || process.env.DATABASE_SSL === 'disable' ? false : 'require';
const sql = postgres(connectionString, { ssl: sslOption });

const name = process.env.SEED_NAME || 'Test User';
const email = process.env.SEED_EMAIL || 'test@example.com';
const password = process.env.SEED_PASSWORD || 'Password123!';
const role = process.env.SEED_ROLE || 'ADMIN';

(async () => {
  try {
    // Ensure schema exists (extension + users table)
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text,
        email text UNIQUE NOT NULL,
        password text NOT NULL,
        role text NOT NULL DEFAULT 'EMPLOYEE',
        created_at timestamptz DEFAULT now()
      )
    `;

    const hash = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hash}, ${role})
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role;
    `;
    console.log(`Seeded user ${email} (password: ${password})`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed user:', err);
    process.exit(1);
  }
})();
