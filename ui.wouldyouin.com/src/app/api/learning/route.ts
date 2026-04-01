/**
 * /api/learning → FastAPI GET /api/v1/learning
 * 서버 사이드 프록시 (Mixed Content 방지)
 */
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function authHeader(req: NextRequest): Record<string, string> {
  const cookie = req.cookies.get("vding_auth")?.value;
  return cookie ? { Authorization: `Bearer ${cookie}` } : {};
}

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${API_URL}/api/v1/learning`;
    const res = await fetch(backendUrl, {
      headers: { ...authHeader(request) },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) {
      console.error("[Learning API] Backend error:", res.status, res.statusText);
      // 백엔드 에러 시에도 빈 배열 반환하여 프론트엔드가 계속 작동하도록
      return NextResponse.json(
        { message: "학습 콘텐츠 목록", data: [] },
        { status: 200 }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Learning API] Connection failed:", {
      error: errorMessage,
      apiUrl: API_URL,
      backendUrl: `${API_URL}/api/v1/learning`,
    });
    // 연결 실패 시에도 빈 배열 반환하여 프론트엔드가 계속 작동하도록
    return NextResponse.json(
      { message: "학습 콘텐츠 목록", data: [] },
      { status: 200 }
    );
  }
}
