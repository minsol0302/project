import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function authHeader(req: NextRequest): Record<string, string> {
  const cookie = req.cookies.get("vding_auth")?.value;
  return cookie ? { Authorization: `Bearer ${cookie}` } : {};
}

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/v1/community/board`, {
      headers: { ...authHeader(request) },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "게시판 글 목록", data: [] }, { status: 503 });
  }
}
