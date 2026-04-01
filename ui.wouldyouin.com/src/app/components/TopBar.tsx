"use client";

import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

// 다크모드 적용 함수 (컴포넌트 외부에 정의)
const applyDarkMode = (dark: boolean) => {
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }
};

export function TopBar() {
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 초기 다크모드 상태 설정 (useLayoutEffect로 즉시 실행)
  useEffect(() => {
    // 초기 다크모드 상태 확인 (localStorage 또는 시스템 설정)
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved ? saved === "true" : prefersDark;
    setIsDarkMode(shouldBeDark);
    applyDarkMode(shouldBeDark);
  }, []);

  useEffect(() => {
    fetch("/api/social?path=notifications/count")
      .then((res) => res.json())
      .then((data) => {
        setNotifCount(data.notif_count ?? 0);
      })
      .catch(() => {});

    // storage 이벤트 리스너 (다른 탭에서 변경된 경우 동기화)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode") {
        const newMode = e.newValue === "true";
        setIsDarkMode(newMode);
        applyDarkMode(newMode);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    applyDarkMode(newMode);
  };

  return (
    <header className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 px-4 py-3 z-40">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">VDING</h1>
        <div className="flex items-center gap-3">
          {/* 다크/화이트 모드 토글 */}
          <button
            aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            onClick={toggleDarkMode}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              {isDarkMode ? "라이트" : "다크"}
            </span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${
              isDarkMode ? "bg-zinc-700" : "bg-zinc-300"
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                isDarkMode ? "translate-x-4" : "translate-x-1"
              }`} />
            </div>
          </button>
          <button
            aria-label="Notifications"
            className="relative"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
