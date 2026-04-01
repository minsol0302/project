import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function authHeader(req: NextRequest): Record<string, string> {
  const cookie = req.cookies.get("vding_auth")?.value;
  return cookie ? { Authorization: `Bearer ${cookie}` } : {};
}

/** GET /api/drafts  → list drafts
 *  GET /api/drafts?id=xxx → get single draft
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("id");

  const backendPath = draftId
    ? `${API_URL}/api/v1/drafts/${draftId}`
    : `${API_URL}/api/v1/drafts`;

  try {
    const res = await fetch(backendPath, {
      headers: { ...authHeader(request) },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}

/** POST /api/drafts  → save/upsert draft */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/v1/drafts/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(request) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}

/** DELETE /api/drafts?id=xxx  → delete draft */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("id");
  if (!draftId) {
    return NextResponse.json({ error: "Missing draft id" }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_URL}/api/v1/drafts/${draftId}`, {
      method: "DELETE",
      headers: { ...authHeader(request) },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server unavailable" }, { status: 503 });
  }
}
