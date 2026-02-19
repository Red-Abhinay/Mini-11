import { NextRequest } from "next/server";
import { clearSessionCookie } from "../../../../lib/auth";

export async function POST(_: NextRequest) {
  try {
    const cookie = clearSessionCookie();
    return new Response(JSON.stringify({ ok: true }), {
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
