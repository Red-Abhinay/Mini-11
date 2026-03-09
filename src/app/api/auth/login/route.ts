import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("All fields are required.", 400);
    }

    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql(
      "SELECT id, name, email, password, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.length === 0) {
      return errorResponse("Invalid email or password.", 401);
    }

    const user = result[0];

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse("Invalid email or password.", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return errorResponse("Internal server error.", 500);
  }
}