"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Download } from "lucide-react";

export interface Episode {
  id: string;
  number: number;
  title: string;
  date: string;
  duration: string; // "63분"
  thumbnailUrl: string;
  description?: string;
}

interface EpisodeCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const [isScraped, setIsScraped] = useState(false);

  return (
    <div className="flex flex-col gap-0">
      {/* 에피소드 행 */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* 썸네일 */}
        <div className="relative flex-shrink-0 w-28 h-16 rounded overflow-hidden bg-zinc-800">
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
          {/* 재생 버튼 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white fill-white ml-0.5"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 텍스트 정보 */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-snug truncate">
            {episode.number}. {episode.title}
          </p>
          <p className="text-zinc-400 text-xs mt-0.5">
            {episode.date} · {episode.duration}
          </p>
        </div>

        {/* 스크랩 버튼 */}
        <button
          onClick={() => setIsScraped((prev) => !prev)}
          className="flex-shrink-0 p-1.5 rounded-full transition-colors hover:bg-zinc-800"
          aria-label={isScraped ? "스크랩 해제" : "스크랩"}
        >
          {isScraped ? (
            <BookmarkCheck
              className="w-5 h-5 transition-colors duration-200"
              style={{ color: "#3B82F6" }} // 파란색 active state
              fill="#3B82F6"
              strokeWidth={2}
            />
          ) : (
            <Bookmark
              className="w-5 h-5 text-zinc-400 transition-colors duration-200 hover:text-zinc-200"
              strokeWidth={2}
            />
          )}
        </button>

        {/* 다운로드 버튼 */}
        <button className="flex-shrink-0 p-1.5 rounded-full hover:bg-zinc-800 transition-colors">
          <Download className="w-5 h-5 text-zinc-400" strokeWidth={2} />
        </button>
      </div>

      {/* 에피소드 설명 */}
      {episode.description && (
        <p className="px-4 pb-3 text-zinc-500 text-xs leading-relaxed line-clamp-2">
          {episode.description}
        </p>
      )}

      {/* 구분선 */}
      <div className="mx-4 h-px bg-zinc-800" />
    </div>
  );
}

