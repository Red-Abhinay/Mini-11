import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return errorResponse("All fields are required.", 400);
    }

    const sql = neon(process.env.DATABASE_URL!);

    const existing = await sql(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return errorResponse("Email already registered.", 409);
    }

    const hashedPassword = await hashPassword(password);

    const result = await sql(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase(), hashedPassword, role]
    );

    return successResponse({ user: result[0] }, 201);

  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return errorResponse("Internal server error.", 500);
  }
}