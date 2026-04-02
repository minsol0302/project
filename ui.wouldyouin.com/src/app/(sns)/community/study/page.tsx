'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, MapPin, Clock } from "lucide-react";
import { MOCK_STUDIES, type StudyGroup } from "./study-data";

function sanitizeText(value: string): string {
  return value.replace(/dummy[_\s]*/gi, "").replace(/\s{2,}/g, " ").trim();
}

function dedupeStudies(items: StudyGroup[]): StudyGroup[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name}|${item.day}|${item.location}`;
    if (!item.name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function StudyPage() {
  const [studies, setStudies] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const allStudiesRef = useRef<StudyGroup[]>([]);

  const INITIAL_VISIBLE_COUNT = 4;
  const LOAD_BATCH_SIZE = 2;

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await fetch("/api/community/study");
        const data = await res.json();
        const fetched: StudyGroup[] = (data?.data ?? []) as StudyGroup[];

        const normalized = fetched.map((study, idx) => ({
          id: study.id || `study_${idx}`,
          name: sanitizeText(study.name ?? "스터디 모임"),
          day: sanitizeText(study.day ?? "요일 미정"),
          location: sanitizeText(study.location ?? "장소 미정"),
          members: sanitizeText(study.members ?? "0/0명"),
          tag: sanitizeText(study.tag ?? "스터디"),
        }));

        const source = dedupeStudies(normalized);
        const all = source.length >= 8 ? source : MOCK_STUDIES;

        if (!cancelled) {
          allStudiesRef.current = all;
          setStudies(all.slice(0, Math.min(INITIAL_VISIBLE_COUNT, all.length)));
        }
      } catch (err) {
        console.warn("[Study API] 백엔드 미연결:", (err as Error).message);
        if (!cancelled) {
          allStudiesRef.current = MOCK_STUDIES;
          setStudies(MOCK_STUDIES.slice(0, Math.min(INITIAL_VISIBLE_COUNT, MOCK_STUDIES.length)));
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
        const all = allStudiesRef.current;
        if (!all.length || studies.length >= all.length) return;

        setLoadingMore(true);
        try {
          const nextCount = Math.min(studies.length + LOAD_BATCH_SIZE, all.length);
          setStudies(all.slice(0, nextCount));
        } finally {
          setLoadingMore(false);
        }
      },
      { root: null, rootMargin: "180px", threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadingMore, studies.length]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {studies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Users className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">스터디 모임이 없습니다.</p>
        </div>
      ) : (
        studies.map((study) => (
          <Link
            key={study.id}
            href={`/community/study/${encodeURIComponent(study.id)}`}
            className="block w-full text-left rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-sm font-semibold">{study.name}</p>
              <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
                모집중
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{study.day}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{study.location}</span>
            </div>
            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
                <Users className="w-3 h-3 shrink-0" />
                <span>{study.members}</span>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">
                #{study.tag}
              </span>
            </div>
          </Link>
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
