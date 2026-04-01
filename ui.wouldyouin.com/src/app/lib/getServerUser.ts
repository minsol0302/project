/**
 * Server-side user fetcher
 * Reads httpOnly cookie and calls backend /api/v1/auth/me
 * Used in Server Components only
 */
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export interface ServerUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  role: string;
}

/**
 * Get authenticated user from backend (server-side only)
 * Returns null if unauthenticated or on error
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("vding_auth")?.value;
    if (!token) return null;

    // 로컬 개발 로그인 토큰 지원
    if (process.env.NODE_ENV !== "production" && token.startsWith("local-dev-token:")) {
      const username = token.replace("local-dev-token:", "") || "vdingadmin";
      return {
        id: "local-dev",
        username,
        role: "ADMIN",
      };
    }

    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as ServerUser;
  } catch {
    return null;
  }
}

/**
 * Get auth token from cookie (server-side only)
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("vding_auth")?.value ?? null;
  } catch {
    return null;
  }
}
