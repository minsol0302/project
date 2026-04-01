"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/* ── 테마 페이지 경로 패턴 ── */
const THEME_PATHS = [
  "/vding/sns/",
  "/vding/community/",
  "/vding/edtech/",
  "/vding/esg/",
  "/vding/fintech/",
  "/vding/messaging/",
  "/vding/marketing/",
];

export const SIDEBAR_EVENT = "open-vding-sidebar";

/* ── SVG 아이콘 ── */
const SvgIcons = {
  Menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  /** X 대신 왼쪽 꺽쇠(<)로 닫기 */
  Back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  User: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ChevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  Search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  ),
};

/* ── 카테고리 바 컴포넌트 ── */
function CategoryBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isProjectPage = THEME_PATHS.some((p) => pathname.startsWith(p));

  /* 테마 페이지 내 햄버거 버튼에서 발행하는 이벤트 수신 */
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(SIDEBAR_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_EVENT, handler);
  }, []);

  const getIsActive = (href: string) => {
    if (isProjectPage) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* ── 토글 버튼 — 왼쪽 상단 고정
           이슈 1: 모바일 프로젝트 페이지에서는 숨김
                   (모바일 컨트롤 바 안에 이미 햄버거가 있음) ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed top-4 left-4 z-[60] w-9 h-9 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-gray-200 flex items-center justify-center hover:shadow-xl transition-all
          ${isProjectPage ? "hidden md:flex" : "flex"}`}
        aria-label="카테고리 바 열기"
      >
        {SvgIcons.Menu}
      </button>

      {/* ── 백드롭 ── */}
      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── 사이드 패널 ── */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-[80] bg-white shadow-2xl border-r border-gray-100 flex flex-col transition-all duration-300 ease-out ${
          open ? "w-56" : "w-0 overflow-hidden"
        }`}
      >
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-gray-100">
          <span className="font-black text-gray-900 tracking-tight">VDing</span>
          {/* 이슈 4: X → 왼쪽 꺽쇠(<) */}
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            {SvgIcons.Back}
          </button>
        </div>

        {/* 네비게이션 항목 */}
        <nav className="flex-1 py-3 overflow-y-auto">

          {/* ── 프로필 ── */}
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium transition-colors
              ${(pathname === "/profile" || pathname.startsWith("/profile/"))
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-400">{SvgIcons.User}</span>
              <span>프로필</span>
            </div>
            {SvgIcons.ChevronRight}
          </button>

          {/* ── 나머지 항목 ── */}
          {[
            { href: "/explore",              label: "Explore",  icon: SvgIcons.Search },
            { href: "/feed",                 label: "피드",     icon: SvgIcons.Grid },
            { href: "/community/contests",   label: "커뮤니티", icon: SvgIcons.Users },
            { href: "/learning",             label: "러닝",     icon: SvgIcons.Book },
          ].map((item) => {
            const isActive = getIsActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 패널 하단 */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">VDing — AI 앱 빌더</p>
        </div>
      </div>
    </>
  );
}

/* ── 레이아웃 ── */
export default function VdingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryBar />
    </>
  );
}
