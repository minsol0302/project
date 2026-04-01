'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Users } from "lucide-react";
import Image from "next/image";

interface LearningItem {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  author: string;
  duration_min: number;
  participant_count?: number;
  tags?: string[];
  stage_count?: number;
}

export default function LearningPage() {
  const router = useRouter();
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learning")
      .then((res) => {
        if (!res.ok) {
          console.error("[Learning Page] API error:", res.status, res.statusText);
          return { data: [] };
        }
        return res.json();
      })
      .then((data) => {
        console.log("[Learning Page] Received data:", data);
        setItems(data.data ?? []);
      })
      .catch((err) => {
        console.error("[Learning Page] Fetch error:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 z-10">
        <h2 className="text-lg font-semibold">러닝</h2>
        <p className="text-xs text-gray-500 mt-1">
          내가 관심 있는 주제의 학습 콘텐츠를 모아서 보여줘요.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <BookOpen className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">아직 학습 콘텐츠가 없습니다.</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`/learning/${item.id}`)}
              className="w-full text-left rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg"
            >
              {/* 배너 영역 - 파란 배경 */}
              <div className="relative w-full h-48 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title}
                    fill
                    className="object-cover opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
                )}
                
                {/* 참여자 수 배지 - 좌측 상단 */}
                {item.participant_count !== undefined && item.participant_count > 0 && (
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
                    {item.participant_count}명 참여중
                  </div>
                )}
                
                {/* 카테고리 태그 - 중앙 좌측 */}
                {item.category && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 border border-white/80 text-white text-xs font-semibold px-2.5 py-1 rounded bg-white/10 backdrop-blur-sm">
                    {item.category}
                  </div>
                )}
                
                {/* 제목 - 중앙 하단 */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
              
              {/* 하단 정보 영역 */}
              <div className="p-4 bg-white">
                {/* 제목 (반복) */}
                <p className="text-base font-bold text-gray-900 mb-2">{item.title}</p>
                
                {/* 태그들 */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 스테이지 수 */}
                {item.stage_count !== undefined && item.stage_count > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {item.stage_count} Stages
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
