'use client';

import { useEffect, useRef, useState } from "react";
import { Briefcase, MapPin } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
}

const MOCK_JOBS: Job[] = [
  { id: "job_1", title: "주니어 프론트엔드 개발자", company: "오르빗랩", location: "서울 성수", type: "정규직" },
  { id: "job_2", title: "백엔드 개발자 (Node.js)", company: "넥스트웨이브", location: "판교", type: "정규직" },
  { id: "job_3", title: "프로덕트 디자이너", company: "모션픽셀", location: "서울 을지로", type: "정규직" },
  { id: "job_4", title: "데이터 분석가", company: "인사이트허브", location: "원격", type: "계약직" },
  { id: "job_5", title: "콘텐츠 마케터", company: "브랜드스케일", location: "서울 강남", type: "정규직" },
  { id: "job_6", title: "QA 엔지니어", company: "테스트포지", location: "부산", type: "정규직" },
  { id: "job_7", title: "모바일 앱 개발자 (Flutter)", company: "앱브릿지", location: "대전", type: "정규직" },
  { id: "job_8", title: "사업개발 매니저", company: "비즈플로우", location: "서울 여의도", type: "정규직" },
  { id: "job_9", title: "AI 엔지니어", company: "딥노트", location: "판교", type: "정규직" },
  { id: "job_10", title: "서비스 기획자", company: "프로덕트웍스", location: "서울 홍대", type: "정규직" },
  { id: "job_11", title: "인사 운영 매니저", company: "피플앤컬처", location: "서울 시청", type: "계약직" },
  { id: "job_12", title: "브랜드 영상 PD", company: "크리에이티브독", location: "서울 합정", type: "인턴" },
];

function sanitizeText(value: string): string {
  return value.replace(/dummy[_\s]*/gi, "").replace(/\s{2,}/g, " ").trim();
}

function dedupeJobs(items: Job[]): Job[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title}|${item.company}|${item.location}|${item.type}`;
    if (!item.title || !item.company || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const allJobsRef = useRef<Job[]>([]);

  const INITIAL_VISIBLE_COUNT = 4;
  const LOAD_BATCH_SIZE = 3;

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await fetch("/api/community/jobs");
        const data = await res.json();
        const fetched: Job[] = (data?.data ?? []) as Job[];

        const normalized = fetched.map((job, idx) => ({
          id: job.id || `job_${idx}`,
          title: sanitizeText(job.title ?? ""),
          company: sanitizeText(job.company ?? ""),
          location: sanitizeText(job.location ?? "지역 미정"),
          type: sanitizeText(job.type ?? "고용 형태 미정"),
        }));

        const source = dedupeJobs(normalized);
        const all = source.length >= 9 ? source : MOCK_JOBS;

        if (!cancelled) {
          allJobsRef.current = all;
          setJobs(all.slice(0, Math.min(INITIAL_VISIBLE_COUNT, all.length)));
        }
      } catch (err) {
        console.warn("[Jobs API] 백엔드 미연결:", (err as Error).message);
        if (!cancelled) {
          allJobsRef.current = MOCK_JOBS;
          setJobs(MOCK_JOBS.slice(0, Math.min(INITIAL_VISIBLE_COUNT, MOCK_JOBS.length)));
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

        const all = allJobsRef.current;
        if (!all.length || jobs.length >= all.length) return;

        setLoadingMore(true);
        try {
          const nextCount = Math.min(jobs.length + LOAD_BATCH_SIZE, all.length);
          setJobs(all.slice(0, nextCount));
        } finally {
          setLoadingMore(false);
        }
      },
      { root: null, rootMargin: "180px", threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [jobs.length, loading, loadingMore]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Briefcase className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">아직 채용 정보가 없습니다.</p>
        </div>
      ) : (
        jobs.map((job) => (
          <button
            key={job.id}
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{job.title}</p>
                <p className="text-xs text-gray-500">{job.company}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{job.location}</span>
                  <span className="mx-1">·</span>
                  <span>{job.type}</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-500">지원하기</span>
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
