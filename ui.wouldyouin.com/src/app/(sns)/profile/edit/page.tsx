'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, User } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "../../../store/useAuthStore";

// 환경에 맞는 백엔드 URL 결정
const BACKEND = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.wouldyouin.com")
  : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

// URL 변환 함수 (S3 URL 우선, 로컬 경로는 백엔드 URL 추가)
const toSrc = (url: string | null): string | null => {
  if (!url) return null;
  // S3 URL은 그대로 사용
  if (url.startsWith("https://")) return url;
  // 로컬 경로는 백엔드 URL 추가 (하위 호환성)
  if (url.startsWith("/data/")) return BACKEND + url;
  return url;
};

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(toSrc(user?.avatar_url || null) || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/profile");
      } else {
        setError(data.detail || "저장 실패");
      }
    } catch (err) {
      setError("네트워크 오류");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">프로필 편집</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-blue-500 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? "저장 중..." : "완료"}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {avatarUrl && avatarUrl.trim() ? (
            <Image
              src={avatarUrl}
              alt={user?.username || ""}
              width={100}
              height={100}
              className="w-24 h-24 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">프로필 사진 변경 (준비 중)</p>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            소개
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="자기소개를 입력하세요"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
