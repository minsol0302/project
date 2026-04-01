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
    const backendUrl = `${API_URL}/api/v1/learning/${id}/progress`;
    
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(request),
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[Learning Progress API] Backend error:", res.status, res.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch learning progress" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Learning Progress API] Connection failed:", {
      error: errorMessage,
      apiUrl: API_URL,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // sendBeacon에서 Blob으로 전송된 경우 처리
    let body: any;
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else {
      // Blob 데이터를 텍스트로 읽기
      const blob = await request.blob();
      const text = await blob.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid request body" },
          { status: 400 }
        );
      }
    }
    
    const backendUrl = `${API_URL}/api/v1/learning/${id}/progress`;
    
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(request),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[Learning Progress API] Backend error:", res.status, res.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to update learning progress" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Learning Progress API] Connection failed:", {
      error: errorMessage,
      apiUrl: API_URL,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
