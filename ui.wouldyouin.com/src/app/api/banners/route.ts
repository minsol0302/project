import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://api.wouldyouin.com:8080/api/v1";

async function getAuthHeader(): Promise<{ Authorization?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vding_auth")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/feed2/banners`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("fetch failed");
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ banners: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = await getAuthHeader();
  const headers: HeadersInit = authHeader.Authorization
    ? {
        "Content-Type": "application/json",
        Authorization: authHeader.Authorization,
      }
    : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}/feed2/banners`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const authHeader = await getAuthHeader();
  const headers: HeadersInit = authHeader.Authorization
    ? {
        "Content-Type": "application/json",
        Authorization: authHeader.Authorization,
      }
    : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}/feed2/banners/${body.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const authHeader = await getAuthHeader();
  const res = await fetch(`${API_BASE}/feed2/banners/${id}`, {
    method: "DELETE",
    headers: { ...authHeader },
  });
  return NextResponse.json(await res.json());
}

