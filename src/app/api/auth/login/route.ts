import { NextRequest } from "next/server";
import { getSql } from "../../../../lib/db";
import { comparePassword, signJwt, createSessionCookie } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // quick diagnostics: ensure the server can parse the DATABASE_URL
    const conn = process.env.DATABASE_URL || null;
    try {
      if (!conn) throw new Error('DATABASE_URL empty');
      // will throw if invalid
      // eslint-disable-next-line no-new
      new URL(conn);
    } catch (e: any) {
      return new Response(JSON.stringify({ error: 'Invalid DATABASE_URL in server', detail: e?.message || String(e), preview: conn ? conn.slice(0, 80) : null }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getSql();
    const rows = await sql`SELECT id, email, password, role FROM users WHERE email = ${email}`;
    const user = rows && rows[0] ? rows[0] : null;
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    const cookie = createSessionCookie(token);

    const safeUser = { id: user.id, email: user.email, role: user.role };
    return new Response(JSON.stringify({ user: safeUser }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
