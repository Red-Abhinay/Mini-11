const dotenv = require('dotenv');
dotenv.config();

const postgres = require('postgres');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const sslOption = process.env.DATABASE_SSL === 'false' || process.env.DATABASE_SSL === 'disable' ? false : 'require';
const sql = postgres(connectionString, { ssl: sslOption });

const email = process.argv[2] || process.env.TEST_EMAIL || process.env.SEED_EMAIL;
const password = process.argv[3] || process.env.TEST_PASSWORD || process.env.SEED_PASSWORD;

if (!email || !password) {
  console.error('Usage: node test-login.js <email> <password>');
  process.exit(1);
}

(async () => {
  try {
    const rows = await sql`SELECT id, email, password, role FROM users WHERE email = ${email}`;
    const user = rows && rows[0] ? rows[0] : null;
    if (!user) {
      console.log('Result: Invalid credentials (user not found)');
      process.exit(0);
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('Result: Invalid credentials (incorrect password)');
      process.exit(0);
    }
    console.log('Result: Success — authenticated user:', { id: user.id, email: user.email, role: user.role });
    process.exit(0);
  } catch (err) {
    console.error('Error during login test:', err);
    process.exit(1);
  }
})();
