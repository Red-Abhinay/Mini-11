import { NextRequest } from "next/server";
import { getSql } from "../../../lib/db";
import { hashPassword, signJwt, createSessionCookie } from "../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body || {};

    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // check existing
    const sql = getSql();
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashed = await hashPassword(password);

    const inserted = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashed}, ${role})
      RETURNING id, email, role
    `;

    const user = inserted && inserted[0] ? inserted[0] : null;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unable to create user" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    const cookie = createSessionCookie(token);

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
