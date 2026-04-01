"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, UserPlus, Bell, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor_username: string | null;
  actor_avatar: string | null;
}

// 환경에 맞는 백엔드 URL 결정
const BACKEND = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.wouldyouin.com")
  : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

const ICON_MAP: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-red-500" />,
  follow: <UserPlus className="w-4 h-4 text-blue-500" />,
  comment: <MessageCircle className="w-4 h-4 text-green-500" />,
  announcement: <Bell className="w-4 h-4 text-yellow-500" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social?path=notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">{"\uc54c\ub9bc"}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Bell className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">{"\uc54c\ub9bc\uc774 \uc5c6\uc2b5\ub2c8\ub2e4"}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map((n) => {
            const avatarSrc = n.actor_avatar
              ? n.actor_avatar.startsWith("https://")
                ? n.actor_avatar
                : n.actor_avatar.startsWith("/data/")
                  ? `${BACKEND}${n.actor_avatar}`
                  : n.actor_avatar
              : null;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 ${
                  !n.is_read ? "bg-blue-50/50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={n.actor_username ?? ""}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      {ICON_MAP[n.type] ?? <Bell className="w-4 h-4 text-gray-400" />}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {n.actor_username && (
                      <span className="font-semibold">{n.actor_username}</span>
                    )}{" "}
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>

                {/* Type icon */}
                <div className="flex-shrink-0 mt-1">
                  {ICON_MAP[n.type] ?? <Bell className="w-4 h-4 text-gray-300" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
