-- Database schema for basic auth/users table
-- Run this on your Neon Postgres instance (psql or via Neon UI)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'EMPLOYEE',
  created_at timestamptz DEFAULT now()
);
