"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Grid3x3,
  Bookmark,
  BookOpen,
  Menu,
  User,
  PlusCircle,
  Zap,
  FileEdit,
  Trash2,
  Clock,
} from "lucide-react";

import { useVdingStore } from "../../store/useVdingStore";
import { ScheduleCarousel } from "../../components/ScheduleCarousel";

interface AuthUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  role: string;
}

interface Post {
  id: string;
  image_urls: string[] | string;
  caption: string | null;
  filter: string;
  created_at: string;
}

function safeImageUrls(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

interface PostsPage {
  posts: Post[];
  count: number;
  has_more: boolean;
  page: number;
}

interface VdingProject {
  project_id: string;
  project_title: string;
  category: string;
  ui_style: string;
  step: string;
  updated_at: string;
  thumbnail_color: string;
}

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ??
  "http://localhost:8080";

const CATEGORY_KO: Record<string, string> = {
  sns: "SNS",
  messaging: "메시지",
  community: "커뮤니티",
  ecommerce: "쇼핑몰",
  productivity: "생산성",
  edtech: "교육",
  health: "헬스",
  fintech: "금융",
  esg: "ESG",
  marketing: "마케팅",
};

const STEP_LABEL: Record<string, { label: string; color: string }> = {
  category_selected: { label: "카테고리 선택 완료", color: "text-yellow-600" },
  ui_theme_selected: { label: "테마 선택 완료", color: "text-orange-600" },
  style_selected: { label: "프리뷰 생성 완료", color: "text-green-700" },
  preview: { label: "편집 완료", color: "text-blue-700" },
};

const UI_STYLE_PAGE_MAP: Record<string, string> = {
  feed_centric: "/vding/sns/feed_centric",
  shortform: "/vding/sns/shortform",
  bubble_chat: "/vding/messaging/bubble_chat",
  simple_transfer: "/vding/fintech/simple_transfer",
  gamified_learning: "/vding/edtech/gamified_learning",
  content_learning: "/vding/edtech/content_learning",
  event_meetup: "/vding/community/event_meetup",
};

const INITIAL_SIZE = 4;
const NEXT_SIZE = 10;

async function fetchProfilePosts({ pageParam = 1 }: { pageParam?: number }): Promise<PostsPage> {
  const size = pageParam === 1 ? INITIAL_SIZE : NEXT_SIZE;
  const res = await fetch(`/api/profile/posts?page=${pageParam}&size=${size}`);
  if (!res.ok) return { posts: [], count: 0, has_more: false, page: pageParam };
  return res.json();
}

async function fetchVdingProjects(): Promise<VdingProject[]> {
  const res = await fetch("/api/vding/projects");
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects ?? [];
}

interface Draft {
  id: string;
  caption: string;
  location: string;
  hashtags: string[];
  thumbnail_idx: number;
  updated_at: string;
  created_at: string;
}

async function fetchDrafts(): Promise<Draft[]> {
  const res = await fetch("/api/drafts");
  if (!res.ok) return [];
  const data = await res.json();
  return data.drafts ?? [];
}

interface LearningHistoryItem {
  id: string;
  content_id: string;
  content_title: string | null;
  content_category: string | null;
  thumbnail_url: string | null;
  author: string | null;
  duration_min: number;
  progress_pct: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  last_accessed: string;
}

async function fetchLearningHistory(): Promise<LearningHistoryItem[]> {
  const res = await fetch("/api/profile/learning-history");
  if (!res.ok) return [];
  const data = await res.json();
  return data.history ?? [];
}

interface ProfileContentProps {
  user: AuthUser;
  initialPosts: PostsPage;
  initialProjects: VdingProject[];
}

export default function ProfileContent({ user, initialPosts, initialProjects }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged" | "vding">("vding");

  const router = useRouter();
  const { setProject } = useVdingStore();
  const queryClient = useQueryClient();

  const { data: postsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: postsLoading } =
    useInfiniteQuery({
      queryKey: ["profile-posts"],
      queryFn: fetchProfilePosts,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      initialData: { pages: [initialPosts], pageParams: [1] },
    });

  const { data: vdingProjects = [], isLoading: vdingLoading, refetch: refetchVding } = useQuery({
    queryKey: ["vding-projects"],
    queryFn: fetchVdingProjects,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    initialData: initialProjects,
  });

  const { data: drafts = [], refetch: refetchDrafts } = useQuery({
    queryKey: ["drafts"],
    queryFn: fetchDrafts,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const deleteDraft = async (draftId: string) => {
    try {
      const res = await fetch(`/api/drafts?id=${draftId}`, { method: "DELETE" });
      if (res.ok) refetchDrafts();
    } catch { /* silent */ }
  };

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== "posts") return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const prefetchNext = useCallback(() => {
    if (!postsData || !hasNextPage || isFetchingNextPage) return;
    const nextPage = (postsData.pages.at(-1)?.page ?? 0) + 1;
    queryClient.prefetchInfiniteQuery({ queryKey: ["profile-posts"], queryFn: fetchProfilePosts, initialPageParam: nextPage });
  }, [postsData, hasNextPage, isFetchingNextPage, queryClient]);

  useEffect(() => {
    if (activeTab === "posts") prefetchNext();
  }, [activeTab, prefetchNext]);

  const avatarUrl = user.avatar_url ?? null;
  const allPosts = postsData?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="mx-auto max-w-[430px] min-h-screen bg-white">

      {/* 프로필 행 */}
      <div className="flex items-center gap-3.5 px-5 pt-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-[#1a1814]">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={user.name ?? user.username} width={64} height={64} className="h-full w-full object-cover" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#111]">{user.username}</span>
            {user.role === "admin" && <span className="text-sm text-[#3897f0]">✔</span>}
            {user.role === "admin" ? (
              <button type="button" onClick={() => router.push("/admin")}
                className="rounded-md bg-[#3d6fdf] px-2 py-0.5 text-[10px] font-semibold text-white">
                어드민
              </button>
            ) : (
              <button type="button" onClick={() => router.push("/subscribe")}
                className="rounded-md bg-[#3d6fdf] px-2 py-0.5 text-[10px] font-semibold text-white">
                구독
              </button>
            )}
            <button type="button" onClick={() => router.push("/profile/settings")}
              className="ml-auto border-0 bg-transparent p-0 text-[#333]" aria-label="Settings">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-0.5 text-xs font-normal text-[#999]">@{user.username}</div>
        </div>
      </div>

      {/* 바이오 */}
      <div className="px-5 pt-4">
        <p className="text-[13.5px] font-normal leading-relaxed text-[#333]">
          {user.bio && user.bio.trim() ? user.bio : "VDing official admin account."}
        </p>
      </div>

      {/* 일정 추가 미니 카드 섹션 */}
      <ScheduleCarousel />

      {/* 탭 */}
      <div className="flex border-b border-gray-200" role="tablist">
        {([
          { key: "vding", Icon: Zap, label: "VDing Projects" },
          { key: "posts", Icon: Grid3x3, label: "Posts" },
          { key: "saved", Icon: Bookmark, label: "Saved" },
          { key: "tagged", Icon: BookOpen, label: "학습 기록" },
        ] as const).map(({ key, Icon, label }) => (
          <button key={key} role="tab" aria-label={label} aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 flex items-center justify-center ${activeTab === key ? "border-b-2 border-black" : ""}`}>
            <Icon className={`w-5 h-5 ${activeTab === key ? "text-black" : "text-gray-400"}`} />
          </button>
        ))}
      </div>

      {/* Posts */}
      {activeTab === "posts" && (
        <>
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => router.push("/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm transition">
                <PlusCircle className="w-3.5 h-3.5" />게시물 생성하기
              </button>
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ["profile-posts"] })}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
                </svg>
              </button>
            </div>
          </div>

          {drafts.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <FileEdit className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-700">임시저장 ({drafts.length})</h3>
              </div>
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div key={draft.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <FileEdit className="w-5 h-5 text-orange-400" />
                    </div>
                    <button className="flex-1 min-w-0 text-left" onClick={() => router.push(`/create?draft_id=${draft.id}`)}>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {draft.caption ? (draft.caption.length > 40 ? draft.caption.slice(0, 40) + "..." : draft.caption) : "(내용 없음)"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px] text-gray-400">
                          {new Date(draft.updated_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {draft.hashtags.length > 0 && <span className="text-[11px] text-blue-400">{draft.hashtags.slice(0, 3).join(" ")}</span>}
                      </div>
                    </button>
                    <button onClick={() => deleteDraft(draft.id)} className="p-2 rounded-lg hover:bg-orange-100 transition flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {allPosts.map((post) => {
                const urls = safeImageUrls(post.image_urls);
                const firstUrl = urls[0] ?? "";
                const imgSrc = firstUrl.startsWith("https://") ? firstUrl : firstUrl.startsWith("/data/") ? `${BACKEND}${firstUrl}` : firstUrl;
                const isMulti = urls.length > 1;
                return (
                  <div key={post.id} className="relative aspect-square bg-gray-100">
                    {imgSrc ? (
                      <Image src={imgSrc} alt="post" fill sizes="(max-width: 448px) 33vw, 149px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Grid3x3 className="w-6 h-6 text-gray-300" /></div>
                    )}
                    {isMulti && (
                      <div className="absolute top-1.5 right-1.5 bg-black/50 rounded px-1 py-0.5">
                        <span className="text-white text-[10px] font-bold">{urls.length}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : postsLoading ? (
            <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Grid3x3 className="w-14 h-14 mb-3 opacity-30" />
              <p className="text-sm">아직 게시물이 없습니다</p>
              <button className="mt-4 text-sm text-blue-700 font-medium" onClick={() => router.push("/create")}>첫 게시물 올리기</button>
            </div>
          )}

          {isFetchingNextPage && (
            <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </>
      )}

      {/* Saved */}
      {activeTab === "saved" && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Bookmark className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">저장된 게시물이 없습니다</p>
        </div>
      )}

      {/* Learning History */}
      {activeTab === "tagged" && <LearningHistoryTab user={user} />}

      {/* VDing Projects */}
      {activeTab === "vding" && (
        vdingLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : vdingProjects.length > 0 ? (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => router.push("/vding/main")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm transition">
                <PlusCircle className="w-3.5 h-3.5" />새 프로젝트
              </button>
              <button onClick={() => refetchVding()} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {vdingProjects.map((proj) => {
                const stepInfo = STEP_LABEL[proj.step];
                const isComplete = proj.step === "style_selected" || proj.step === "preview";

                // 카테고리에 따른 그라데이션 색상 결정
                const getGradientClass = () => {
                  if (proj.category === "fintech") {
                    return "bg-gradient-to-br from-blue-300/60 via-blue-200/40 to-purple-200/30";
                  }
                  return "bg-gradient-to-br from-pink-300/60 via-purple-300/50 to-pink-200/30";
                };

                return (
                  <button key={proj.project_id}
                    onClick={() => {
                      const targetPage = UI_STYLE_PAGE_MAP[proj.ui_style];
                      if (targetPage) {
                        setProject({ projectId: proj.project_id, ideaText: "", categoryId: proj.category, themeId: proj.ui_style });
                        router.push(targetPage);
                      } else {
                        console.warn(`[Profile] No page mapping found for UI style: ${proj.ui_style}`);
                      }
                    }}
                    className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm text-left hover:shadow-md transition-all">
                    <div className={`w-full h-32 ${getGradientClass()} flex items-center justify-center relative`}>
                      {/* 유리 질감 아이콘 박스 */}
                      <div className="bg-white/40 backdrop-blur-md p-7 rounded-2xl border border-white/50 shadow-xl">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      {/* 완료 뱃지 */}
                      {isComplete && (
                        <span className="absolute top-2 right-2 bg-purple-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
                          완료
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-xs font-bold text-gray-900 truncate leading-tight mb-1">
                        {proj.project_title || "제목 생성 전"}
                      </p>
                      <p className="text-[10px] text-gray-500 mb-1">
                        {CATEGORY_KO[proj.category] ?? proj.category}
                      </p>
                      {stepInfo && (
                        <p className="text-[9px] font-medium text-purple-600 mb-1">
                          {stepInfo.label}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-500">
                        {new Date(proj.updated_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-6 text-center">
            <Zap className="w-14 h-14 mb-3 opacity-30" />
            <p className="text-sm font-medium">아직 만든 서비스가 없습니다</p>
            <p className="text-xs mt-1">아이디어만 있으면 나만의 앱을 만들 수 있어요</p>
            <button onClick={() => router.push("/vding/main")}
              className="mt-4 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition">
              지금 시작하기
            </button>
          </div>
        )
      )}
    </div>
  );
}

function LearningHistoryTab({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { data: history = [], isLoading } = useQuery<LearningHistoryItem[]>({
    queryKey: ["learning-history"],
    queryFn: fetchLearningHistory,
    staleTime: 1000 * 60 * 2,
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    </div>
  );

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <BookOpen className="w-14 h-14 mb-3 opacity-30" />
      <p className="text-sm">아직 학습 기록이 없습니다</p>
      <button onClick={() => router.push("/learning")} className="mt-4 text-sm text-blue-700 font-medium">
        학습 콘텐츠 보기
      </button>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            router.push(`/learning/${item.content_id}`);
          }}
          className="w-full text-left border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push(`/learning/${item.content_id}`);
            }
          }}
        >
          {item.thumbnail_url && (
            <div className="relative w-full h-32 bg-gray-100">
              <img src={item.thumbnail_url} alt={item.content_title || ""} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-3">
            {item.content_category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                {item.content_category}
              </span>
            )}
            <p className="text-sm font-semibold mt-1 text-gray-900">{item.content_title || "제목 없음"}</p>
            {item.author && <p className="text-xs text-gray-500 mt-0.5">작성자: {item.author}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {item.duration_min > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.duration_min}분
                </span>
              )}
              <span>진행률: {item.progress_pct}%</span>
              {item.completed && <span className="text-green-600 font-medium">완료</span>}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              마지막 학습: {formatDate(item.last_accessed)}
              {item.completed_at && ` | 완료: ${formatDate(item.completed_at)}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
