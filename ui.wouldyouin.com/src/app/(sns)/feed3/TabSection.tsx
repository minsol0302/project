"use client";

import { useState } from "react";

const TABS = ["추천", "뉴진(眞)스", "프로젝트 공유"] as const;
type Tab = (typeof TABS)[number];

interface TabSectionProps {
  children: (activeTab: Tab) => React.ReactNode;
}

export default function TabSection({ children }: TabSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("추천");

  return (
    <div>
      {/* 탭 바 */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30 bg-white dark:bg-black">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
              }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div>{children(activeTab)}</div>
    </div>
  );
}
