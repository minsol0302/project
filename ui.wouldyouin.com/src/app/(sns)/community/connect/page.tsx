'use client';

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Building2 } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  desc: string;
  followers: string;
  category: string;
}

const MOCK_CHANNELS: Channel[] = [
  { id: "channel_1", name: "Vding 공식 채널", desc: "서비스 업데이트와 이벤트 소식을 가장 빠르게 받아보세요.", followers: "5,203", category: "서비스" },
  { id: "channel_2", name: "IT 커리어톡 by TechCorp", desc: "현직자와 커리어 질문을 나누는 오픈 커뮤니티입니다.", followers: "3,412", category: "커리어" },
  { id: "channel_3", name: "Lifestyle 브랜드 라운지", desc: "신제품 정보와 유저 리뷰를 함께 살펴보는 채널입니다.", followers: "2,051", category: "브랜드" },
  { id: "channel_4", name: "개발자 밋업 허브", desc: "세미나, 컨퍼런스, 밋업 일정을 모아서 공유합니다.", followers: "1,876", category: "개발" },
  { id: "channel_5", name: "디자인 인사이트 아카이브", desc: "실무 디자인 팁과 레퍼런스를 정리해 두는 공간입니다.", followers: "2,774", category: "디자인" },
  { id: "channel_6", name: "스타트업 네트워크", desc: "초기 스타트업 팀 빌딩과 협업 제안을 나눕니다.", followers: "1,294", category: "비즈니스" },
  { id: "channel_7", name: "마케팅 실전 노트", desc: "성과 중심 마케팅 사례와 캠페인 회고를 공유합니다.", followers: "2,132", category: "마케팅" },
  { id: "channel_8", name: "생산성 툴 연구소", desc: "협업 툴과 자동화 워크플로우를 함께 실험합니다.", followers: "987", category: "생산성" },
  { id: "channel_9", name: "커뮤니티 운영자 모임", desc: "커뮤니티 운영 지표와 온보딩 전략을 교류합니다.", followers: "1,106", category: "운영" },
  { id: "channel_10", name: "원격근무 베스트프랙티스", desc: "분산팀 협업 방식과 회의 문화를 공유합니다.", followers: "1,568", category: "업무문화" },
  { id: "channel_11", name: "AI 제품 기획 포럼", desc: "AI 기능 설계와 사용자 경험 이슈를 토론합니다.", followers: "1,923", category: "AI" },
  { id: "channel_12", name: "브랜드 커뮤니케이션 스튜디오", desc: "브랜드 톤앤매너와 카피 전략을 다룹니다.", followers: "1,447", category: "커뮤니케이션" },
];

function sanitizeText(value: string): string {
  return value.replace(/dummy[_\s]*/gi, "").replace(/\s{2,}/g, " ").trim();
}

function dedupeChannels(items: Channel[]): Channel[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name}|${item.category}`;
    if (!item.name || !item.desc || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ConnectPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const allChannelsRef = useRef<Channel[]>([]);

  const INITIAL_VISIBLE_COUNT = 4;
  const LOAD_BATCH_SIZE = 3;

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await fetch("/api/community/connect");
        const data = await res.json();
        const fetched: Channel[] = (data?.data ?? []) as Channel[];

        const normalized = fetched.map((ch, idx) => ({
          id: ch.id || `channel_${idx}`,
          name: sanitizeText(ch.name ?? ""),
          desc: sanitizeText(ch.desc ?? ""),
          followers: sanitizeText(ch.followers ?? "0"),
          category: sanitizeText(ch.category ?? "서비스"),
        }));

        const source = dedupeChannels(normalized);
        const all = source.length >= 9 ? source : MOCK_CHANNELS;

        if (!cancelled) {
          allChannelsRef.current = all;
          setChannels(all.slice(0, Math.min(INITIAL_VISIBLE_COUNT, all.length)));
        }
      } catch (err) {
        console.warn("[Connect API] 백엔드 미연결:", (err as Error).message);
        if (!cancelled) {
          allChannelsRef.current = MOCK_CHANNELS;
          setChannels(MOCK_CHANNELS.slice(0, Math.min(INITIAL_VISIBLE_COUNT, MOCK_CHANNELS.length)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || loadingMore) return;

        const all = allChannelsRef.current;
        if (!all.length || channels.length >= all.length) return;

        setLoadingMore(true);
        try {
          const nextCount = Math.min(channels.length + LOAD_BATCH_SIZE, all.length);
          setChannels(all.slice(0, nextCount));
        } finally {
          setLoadingMore(false);
        }
      },
      { root: null, rootMargin: "180px", threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [channels.length, loading, loadingMore]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Building2 className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">소통 채널이 없습니다.</p>
        </div>
      ) : (
        channels.map((ch) => (
          <button
            key={ch.id}
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{ch.name}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{ch.desc}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                  <span>{ch.followers} 팔로워</span>
                  <span>·</span>
                  <span>{ch.category}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">
                팔로우
              </span>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <MessageCircle className="w-3 h-3" />
                <span>문의하기</span>
              </div>
            </div>
          </button>
        ))
      )}

      {loadingMore && (
        <div className="flex justify-center py-3 text-xs text-gray-500">
          더 불러오는 중...
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
