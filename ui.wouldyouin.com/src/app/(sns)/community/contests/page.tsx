'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, Award } from "lucide-react";
import { MOCK_CONTESTS, type Contest } from "./contest-data";

function sanitizeText(value: string): string {
  return value.replace(/dummy[_\s]*/gi, "").replace(/\s{2,}/g, " ").trim();
}

function dedupeContests(items: Contest[]): Contest[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title}|${item.host}`;
    if (!item.title || !item.host || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const allContestsRef = useRef<Contest[]>([]);

  const INITIAL_VISIBLE_COUNT = 3;
  const LOAD_BATCH_SIZE = 4;

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await fetch("/api/community/contests");
        const data = await res.json();

        const fetched: Contest[] = ((data?.data ?? []) as Contest[]).map((c, idx) => ({
          id: c.id || `contest_api_${idx}`,
          title: sanitizeText(c.title ?? ""),
          host: sanitizeText(c.host ?? ""),
          dday: sanitizeText(c.dday ?? "D-30"),
          prize: sanitizeText(c.prize ?? "상금 추후 공개"),
          tags: Array.isArray(c.tags) ? c.tags.map((t) => sanitizeText(t)).filter(Boolean) : [],
        }));

        const source = dedupeContests(fetched);
        const all = source.length >= 9 ? source : MOCK_CONTESTS;

        if (!cancelled) {
          allContestsRef.current = all;
          setContests(all.slice(0, Math.min(INITIAL_VISIBLE_COUNT, all.length)));
        }
      } catch (err) {
        console.warn("[Contests API] 백엔드 미연결:", (err as Error)?.message);
        if (!cancelled) {
          allContestsRef.current = MOCK_CONTESTS;
          setContests(MOCK_CONTESTS.slice(0, INITIAL_VISIBLE_COUNT));
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
    if (!loading) {
      const el = sentinelRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (!first?.isIntersecting) return;
          if (loadingMore) return;

          const all = allContestsRef.current;
          if (!all || all.length === 0) return;
          if (contests.length >= all.length) return;

          setLoadingMore(true);
          try {
            // 목데이터 append: 바로 append (서버 pagination이 없어서)
            const nextCount = Math.min(contests.length + LOAD_BATCH_SIZE, all.length);
            setContests(all.slice(0, nextCount));
          } finally {
            setLoadingMore(false);
          }
        },
        { root: null, rootMargin: "200px", threshold: 0.01 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [loading, loadingMore, contests.length]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {contests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Award className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">아직 공모전 정보가 없습니다.</p>
        </div>
      ) : (
        contests.map((contest) => (
          <Link
            key={contest.id}
            href={`/community/contests/${encodeURIComponent(contest.id)}`}
            className="block w-full text-left rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">{contest.host}</p>
                <p className="text-sm font-semibold">{contest.title}</p>
              </div>
              <span className="text-xs font-semibold text-red-500">
                {contest.dday}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarDays className="w-4 h-4" />
                <span>{contest.prize}</span>
              </div>
              <div className="flex gap-1">
                {contest.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))
      )}

      {loadingMore && (
        <div className="flex justify-center py-4 text-xs text-gray-500">
          더 불러오는 중...
        </div>
      )}

      {/* 무한스크롤 감지 지점 */}
      <div ref={sentinelRef} className="h-1" />

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Award className="w-4 h-4" />
        <span>관심 공모전을 팔로우하면 마감 전에 알림을 받을 수 있어요.</span>
      </div>
    </div>
  );
}
