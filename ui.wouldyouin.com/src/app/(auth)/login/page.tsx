"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "로그인에 실패했습니다.";
        setError(msg);
        alert(msg);
        return;
      }

      // 쿠키가 완전히 저장된 뒤 프록시가 읽을 수 있도록 하드 리다이렉트
      window.location.replace("/vding/main");
    } catch {
      const msg = "서버 연결 오류가 발생했습니다.";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      {/* 로고 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          VDing
        </h1>
        <p className="text-center text-xs text-gray-400 mt-1">
          비딩 — 나만의 SNS
        </p>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition"
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition"
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* 구분선 */}
      <div className="w-full max-w-xs flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 소셜 로그인 (추후 연결) */}
      <div className="w-full max-w-xs space-y-2">
        <button
          disabled
          className="w-full py-3 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <span className="font-bold text-gray-400">G</span>
          Google로 계속하기 (준비 중)
        </button>
        <button
          disabled
          className="w-full py-3 bg-yellow-100 rounded-lg text-sm text-gray-400 cursor-not-allowed"
        >
          카카오로 계속하기 (준비 중)
        </button>
        <button
          disabled
          className="w-full py-3 bg-green-50 rounded-lg text-sm text-gray-400 cursor-not-allowed"
        >
          네이버로 계속하기 (준비 중)
        </button>
      </div>
    </div>
  );
}