"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User, Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

interface StoryUser {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
}

interface StoryItem {
  id: string;
  user: StoryUser;
  image_urls: string[];
  created_at: string;
}

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

export function Stories() {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<StoryItem[]>([]);

  useEffect(() => {
    fetch("/api/social?path=stories")
      .then((res) => res.json())
      .then((data) => setStories(data.stories ?? []))
      .catch(() => {});
  }, []);

  const avatarSrc = toSrc(user?.avatar_url ?? null);

  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-200">
      {/* My story */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={user?.name ?? user?.username ?? "me"}
                  width={56}
                  height={56}
                  className="w-full h-full rounded-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </div>
        <span className="text-xs text-gray-900 max-w-[64px] truncate">
          {user?.username ?? "\ub0b4 \uc2a4\ud1a0\ub9ac"}
        </span>
      </div>

      {/* Followed users' stories - only from DB */}
      {stories.map((story) => {
        const storyAvatar = toSrc(story.user.avatar_url);
        return (
          <button
            key={story.id}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                {storyAvatar ? (
                  <Image
                    src={storyAvatar}
                    alt={story.user.username}
                    width={56}
                    height={56}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-900 max-w-[64px] truncate">
              {story.user.username}
            </span>
          </button>
        );
      })}

      {/* Empty state hint */}
      {stories.length === 0 && (
        <div className="flex items-center px-2">
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {"\ud314\ub85c\uc789\ud55c \uc0ac\uc6a9\uc790\uc758 \uc2a4\ud1a0\ub9ac\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4"}
          </p>
        </div>
      )}
    </div>
  );
}
