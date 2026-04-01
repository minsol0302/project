import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "vding_auth";

function parseJsonSafe(text: string): unknown {
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    const rawText = await upstream.text();
    const parsed = parseJsonSafe(rawText);

    if (!upstream.ok) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json(parsed, { status: 200 });
  } catch {
    // 로컬 개발 로그인 토큰 지원
    if (process.env.NODE_ENV !== "production" && token.startsWith("local-dev-token:")) {
      const username = token.replace("local-dev-token:", "") || "vdingadmin";
      return NextResponse.json({
        id: "local-dev",
        username,
        role: "ADMIN",
      });
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
