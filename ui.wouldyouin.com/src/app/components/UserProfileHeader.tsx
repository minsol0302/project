"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

// 환경에 맞는 백엔드 URL 결정
const BACKEND = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.wouldyouin.com")
  : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

// URL 변환 함수
const toSrc = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("https://")) return url;
  if (url.startsWith("/data/")) return BACKEND + url;
  return url;
};

export function UserProfileHeader() {
  const { user } = useAuthStore();
  const avatarSrc = toSrc(user?.avatar_url ?? null);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={user?.name ?? user?.username ?? "me"}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
            priority
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div>
          <p className="font-semibold text-sm">{user?.username ?? "사용자"}</p>
          {user?.name && (
            <p className="text-xs text-gray-500">{user.name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
