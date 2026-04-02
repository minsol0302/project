'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/community/contests", label: "공모전" },
  { href: "/community/jobs", label: "기업 채용" },
  { href: "/community/board", label: "게시판" },
  { href: "/community/study", label: "스터디 모임" },
];

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-white min-h-screen">
      {/* 커뮤니티 헤더 */}
      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 z-20">
        <h2 className="text-lg font-semibold">커뮤니티</h2>
        <p className="text-xs text-gray-500 mt-1">
          공모전 · 채용 · 게시판 · 스터디까지 한 번에 모아보기
        </p>
      </div>

      {/* 상단 탭 */}
      <div className="sticky top-[3.25rem] bg-white border-b border-gray-200 z-10">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(`${tab.href}/`));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-3 text-sm whitespace-nowrap border-b-2 ${
                  active
                    ? "border-black font-semibold text-black"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pb-16">{children}</div>
    </div>
  );
}

