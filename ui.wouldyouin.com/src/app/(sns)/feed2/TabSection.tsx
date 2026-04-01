"use client";

import { useState } from "react";

const TABS = ["에피소드", "뉴진스", "추천 콘텐츠", "관련 쇼츠"] as const;
type Tab = (typeof TABS)[number];

interface TabSectionProps {
  children: (activeTab: Tab) => React.ReactNode;
}

export default function TabSection({ children }: TabSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("에피소드");

  return (
    <div>
      {/* 탭 바 */}
      <div className="flex border-b border-zinc-800 sticky top-0 z-30 bg-black overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div>{children(activeTab)}</div>
    </div>
  );
}

