/**
 * middleware.ts — Auth guard middleware
 *
 * How it works:
 *   1. JWT_SECRET env set    -> cookie JWT signature verification (production)
 *   2. JWT_SECRET env not set -> cookie existence check only (local dev)
 *      Real auth is handled by backend /api/v1/auth/me
 *
 * Required env (production):
 *   JWT_SECRET   injected via GitHub Actions Secret / Vercel env
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Read from env only - no hardcoding
const JWT_SECRET = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : null;

/** Paths accessible without auth */
const PUBLIC_PREFIXES = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static asset bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public path bypass
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("vding_auth")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // JWT_SECRET set: verify signature (production)
  if (JWT_SECRET) {
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (err) {
      console.error("[middleware] JWT verify failed:", err instanceof Error ? err.message : err);
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("vding_auth");
      return res;
    }
  }
  // JWT_SECRET not set: cookie existence check only (backend handles real verification)

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
