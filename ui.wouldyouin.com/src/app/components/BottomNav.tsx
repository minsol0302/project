"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Users, Search } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";

interface BottomNavProps {
  /** Server-provided avatar URL (avoids hydration mismatch) */
  avatarUrl?: string | null;
}

export function BottomNav({ avatarUrl }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);

  // Use server-provided avatar first, then fall back to store
  const avatar = avatarUrl ?? storeUser?.avatar_url ?? null;

  const navItems = [
    { path: "/feed3", icon: Home, label: "\ud53c\ub4dc", type: "icon" as const },
    { path: "/learning", icon: BookOpen, label: "\ub7ec\ub2dd", type: "icon" as const },
    { path: "/community", icon: Users, label: "\ucee4\ubba4\ub2c8\ud2f0", type: "icon" as const },
    { path: "/explore", icon: Search, label: "\ud0d0\uc0c9", type: "icon" as const },
    { path: "/profile", label: "\ud504\ub85c\ud544", type: "avatar" as const },
  ];

  const fallbackAvatar =
    "https://images.unsplash.com/photo-1635353866477-f77a828b431a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150";

  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 z-50 md:fixed md:bottom-0 md:left-0 md:right-0 md:max-w-md md:mx-auto">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === "/feed3" && pathname === "/feed");

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            router.push(item.path);
          };

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleClick}
              prefetch={true}
              aria-label={item.label}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              {item.type === "icon" && item.icon ? (
                <item.icon
                  className={`w-6 h-6 ${
                    isActive ? "text-black" : "text-gray-400"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive && item.path === "/feed3" ? "black" : "none"}
                  aria-hidden="true"
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full border ${
                    isActive ? "border-black" : "border-gray-300"
                  } overflow-hidden relative`}
                >
                  <Image
                    src={avatar ?? fallbackAvatar}
                    alt="My profile"
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
