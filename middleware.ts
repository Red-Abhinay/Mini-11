import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const MANAGER_ONLY_ROUTES = ["/dashboard/admin", "/dashboard/users"];
const AUTH_ROUTES = ["/login", "/register"];

function decodeRoleFromToken(token: string): "manager" | "employee" | null {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { role?: "manager" | "employee" };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("auth_token")?.value;
  const hasSession = Boolean(token);
  const role = token ? decodeRoleFromToken(token) : null;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isManagerOnly = MANAGER_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isManagerOnly && role !== "manager") {
    return NextResponse.redirect(
      new URL("/dashboard?error=unauthorized", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};