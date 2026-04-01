'use client';

import { useEffect, useRef, useState } from "react";
import { Users, MapPin, Clock } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  day: string;
  location: string;
  members: string;
  tag: string;
}

const MOCK_STUDIES: StudyGroup[] = [
  { id: "study_1", name: "프론트엔드 취업 스터디 (React/TypeScript)", day: "매주 화 목 저녁", location: "온라인", members: "6/8명", tag: "취업 준비" },
  { id: "study_2", name: "백엔드 시스템 설계 스터디", day: "매주 수요일 밤", location: "온라인 (Discord)", members: "5/7명", tag: "백엔드" },
  { id: "study_3", name: "SQL 실전 문제 풀이 모임", day: "주 2회 점심", location: "온라인", members: "7/10명", tag: "데이터" },
  { id: "study_4", name: "알고리즘 코딩 테스트 집중반", day: "매주 월 금", location: "서울 홍대", members: "8/10명", tag: "코테" },
  { id: "study_5", name: "PM 케이스 스터디", day: "격주 토요일", location: "판교", members: "3/6명", tag: "기획" },
  { id: "study_6", name: "UI 리디자인 챌린지", day: "매주 일요일 오전", location: "서울 성수", members: "5/8명", tag: "디자인" },
  { id: "study_7", name: "영어 발표 스터디 (직장인)", day: "주 1회 저녁", location: "온라인 (Zoom)", members: "10/12명", tag: "커뮤니케이션" },
  { id: "study_8", name: "서비스 기획 문서 리뷰 모임", day: "매주 토요일 오후", location: "서울 강남", members: "4/6명", tag: "서비스기획" },
  { id: "study_9", name: "모바일 앱 출시 스프린트 그룹", day: "매주 목요일", location: "대전", members: "5/7명", tag: "앱개발" },
  { id: "study_10", name: "브랜딩 카피라이팅 스터디", day: "격주 수요일", location: "부산", members: "6/9명", tag: "브랜딩" },
  { id: "study_11", name: "제품 데이터 분석 리딩클럽", day: "매주 화요일", location: "온라인", members: "4/7명", tag: "분석" },
  { id: "study_12", name: "QA 자동화 테스트 실습반", day: "매주 금요일 밤", location: "서울 문래", members: "5/8명", tag: "테스트" },
];

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
          <button
            key={study.id}
            className="w-full text-left rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{study.name}</p>
              <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                모집중
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Clock className="w-3 h-3" />
              <span>{study.day}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <MapPin className="w-3 h-3" />
              <span>{study.location}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>{study.members}</span>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                #{study.tag}
              </span>
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
