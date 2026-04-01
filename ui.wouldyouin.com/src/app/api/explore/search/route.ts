/**
 * /api/explore/search?q=  →  FastAPI  /api/v1/explore/search?q=
 */
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function authHeader(request: NextRequest): Record<string, string> {
  const token = request.cookies.get("vding_auth")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const res = await fetch(
      `${API_URL}/api/v1/explore/search?q=${encodeURIComponent(q)}`,
      { headers: { ...authHeader(request) }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return NextResponse.json(await res.json(), { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "서버에 연결할 수 없습니다." }, { status: 503 });
  }
}
