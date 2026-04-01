import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const postId = searchParams.get("post_id");

    if (path === "comments" && postId) {
      const backendUrl = `${API_URL}/social/comments?post_id=${postId}`;
      const res = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      });

      if (!res.ok) {
        return NextResponse.json({ comments: [] });
      }

      const data = await res.json();
      return NextResponse.json({ comments: data.comments || [] });
    }

    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  } catch (err) {
    console.error("[Social API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (path === "comment") {
      const body = await request.json();
      const backendUrl = `${API_URL}/social/comments`;
      
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to create comment" },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json({ comment: data.comment || data });
    }

    if (path === "follow" || path === "unfollow") {
      const body = await request.json();
      const backendUrl = `${API_URL}/social/${path}`;
      
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to ${path}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  } catch (err) {
    console.error("[Social API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
