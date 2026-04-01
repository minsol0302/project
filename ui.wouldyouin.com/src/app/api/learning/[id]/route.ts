import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function authHeader(req: NextRequest): Record<string, string> {
  const cookie = req.cookies.get("vding_auth")?.value;
  return cookie ? { Authorization: `Bearer ${cookie}` } : {};
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = `${API_URL}/api/v1/learning/${id}`;
    
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(request),
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[Learning Detail API] Backend error:", res.status, res.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch learning content" },
        { status: res.status }
      );
    }

    const data = await res.json();
    // 백엔드가 이미 { success: True, data: {...} } 형식으로 반환하므로 그대로 전달
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Learning Detail API] Connection failed:", {
      error: errorMessage,
      apiUrl: API_URL,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
