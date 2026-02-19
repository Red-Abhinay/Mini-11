import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "token";
const MAX_AGE_SECONDS = process.env.SESSION_MAX_AGE_SECONDS
  ? parseInt(process.env.SESSION_MAX_AGE_SECONDS, 10)
  : 60 * 60 * 24 * 7; // default 7 days

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function signJwt(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function createSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${MAX_AGE_SECONDS}`,
    `SameSite=Strict`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function parseCookies(cookieHeader: string | null | undefined) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...v] = part.split("=");
    const key = k.trim();
    const value = v.join("=").trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function getTokenFromHeader(cookieHeader?: string | null) {
  const cookies = parseCookies(cookieHeader || null);
  return cookies[COOKIE_NAME] || null;
}

export { COOKIE_NAME };
