import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "vding_auth";

const DEV_LOGIN_ID = process.env.LOCAL_DEV_LOGIN_ID ?? "vdingadmin";
const DEV_LOGIN_PW = process.env.LOCAL_DEV_LOGIN_PW ?? "vms20260331";

type LoginResponseShape = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: unknown;
  data?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
    user?: unknown;
  };
  [key: string]: unknown;
};

function parseJsonSafe(text: string): LoginResponseShape {
  if (!text) return {};
  try {
    return JSON.parse(text) as LoginResponseShape;
  } catch {
    return {};
  }
}

function extractToken(payload: LoginResponseShape): string | null {
  return (
    payload.token ??
    payload.accessToken ??
    payload.jwt ??
    payload.data?.token ??
    payload.data?.accessToken ??
    payload.data?.jwt ??
    null
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ error: "아이디/비밀번호를 입력해주세요." }, { status: 400 });
    }

    try {
      const upstream = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(8000),
      });

      const rawText = await upstream.text();
      const parsed = parseJsonSafe(rawText);

      if (!upstream.ok) {
        const message =
          (parsed?.error as string | undefined) ??
          (parsed?.message as string | undefined) ??
          "로그인에 실패했습니다.";
        return NextResponse.json({ error: message }, { status: upstream.status });
      }

      const token = extractToken(parsed);
      if (!token) {
        return NextResponse.json({ error: "로그인 토큰이 없습니다." }, { status: 502 });
      }

      const res = NextResponse.json(parsed, { status: upstream.status });
      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      return res;
    } catch {
      // 로컬 개발 편의: 백엔드 미실행 시 고정 계정으로만 로그인 허용
      if (
        process.env.NODE_ENV !== "production" &&
        username === DEV_LOGIN_ID &&
        password === DEV_LOGIN_PW
      ) {
        const res = NextResponse.json({
          message: "local dev login",
          user: { id: "local-dev", username, role: "ADMIN" },
        });
        res.cookies.set({
          name: COOKIE_NAME,
          value: `local-dev-token:${username}`,
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        });
        return res;
      }
      return NextResponse.json({ error: "서버 연결 오류가 발생했습니다." }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
