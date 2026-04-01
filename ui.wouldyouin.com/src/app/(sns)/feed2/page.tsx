"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Plus, Share2 } from "lucide-react";
import BannerSlider, { Banner } from "./BannerSlider";
import EpisodeCard, { Episode } from "./EpisodeCard";
import TabSection from "./TabSection";

// ── 타입 정의 ─────────────────────────────────────────────────────────────────
interface Post {
  id: number;
  category: string;
  title: string;
  content?: string;
  thumbnail_url?: string;
  tag?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  created_at: string;
  author_name: string;
  author_image?: string;
}

interface Short {
  id: number;
  title: string;
  highlight_label?: string;
  highlight_sub?: string;
  thumbnail_url: string;
  duration_sec: number;
  view_count: number;
}

interface RecommendedItem {
  id: number;
  title: string;
  thumbnail_url: string;
  category?: string;
  author_name?: string;
  link_url?: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  summary?: string;
  source: string;
  source_url?: string;
  fact_check_status: string;
  fact_check_date?: string;
  fact_checker?: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  view_count: number;
  like_count: number;
  share_count: number;
  published_at: string;
}

// ── 카테고리 뱃지 매핑 ────────────────────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  learning: "학습",
  community: "커뮤니티",
  contest: "공모전",
  job: "채용",
  vding: "VDing",
};

const CATEGORY_COLOR: Record<string, string> = {
  learning: "bg-blue-600",
  community: "bg-green-700",
  contest: "bg-orange-600",
  job: "bg-purple-600",
  vding: "bg-red-600",
};

// ── 숫자 포맷 ─────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── 날짜 포맷 ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

// ── 포스트를 EpisodeCard 형식으로 변환 ────────────────────────────────────────
function postToEpisode(post: Post, index: number): Episode {
  return {
    id: String(post.id),
    number: index + 1,
    title: post.title,
    date: fmtDate(post.created_at),
    // duration 라벨은 "조회 1.2k" 같이 사용 (EpisodeCard는 string이면 OK)
    duration: `조회 ${fmtNum(post.view_count)}`,
    thumbnailUrl:
      post.thumbnail_url ??
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&q=70",
    description: post.content,
  };
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function Feed2Page() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeNewsCategory, setActiveNewsCategory] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const featuredPost = featured[0] ?? null;

  // ── 데이터 fetch ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bannersRes, featuredRes, postsRes, recommendedRes, shortsRes, newsRes] =
        await Promise.allSettled([
          fetch("/api/banners").then((r) => r.json()),
          fetch("/api/feed2?type=featured").then((r) => r.json()),
          fetch(
            `/api/feed2?type=posts${activeCategory ? `&category=${activeCategory}` : ""
            }`
          ).then((r) => r.json()),
          fetch("/api/feed2?type=recommended").then((r) => r.json()),
          fetch("/api/feed2?type=shorts").then((r) => r.json()),
          fetch(
            `/api/feed2?type=news${activeNewsCategory ? `&category=${activeNewsCategory}` : ""
            }`
          ).then((r) => r.json()),
        ]);

      if (bannersRes.status === "fulfilled") {
        setBanners(bannersRes.value?.banners ?? []);
      }
      if (featuredRes.status === "fulfilled") {
        setFeatured(featuredRes.value?.posts ?? []);
      }
      if (postsRes.status === "fulfilled") {
        setPosts(postsRes.value?.posts ?? []);
      }
      if (recommendedRes.status === "fulfilled") {
        setRecommended(recommendedRes.value?.items ?? []);
      }
      if (shortsRes.status === "fulfilled") {
        setShorts(shortsRes.value?.shorts ?? []);
      }
      if (newsRes.status === "fulfilled") {
        const newsData = newsRes.value?.news ?? [];
        console.log("[Feed2] 뉴스 데이터:", newsData);
        setNews(newsData);
      } else {
        console.error("[Feed2] 뉴스 데이터 fetch 실패:", newsRes);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, activeNewsCategory]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const CATEGORIES = [
    { key: "", label: "전체" },
    { key: "learning", label: "학습" },
    { key: "community", label: "커뮤니티" },
    { key: "contest", label: "공모전" },
    { key: "vding", label: "VDing" },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* ── 광고 배너 슬라이더 ── */}
      <BannerSlider banners={banners} autoPlayInterval={5000} />

      {/* ── 피처드 포스트 헤더 ── */}
      {featuredPost && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`text-white font-bold text-[10px] tracking-widest px-2 py-0.5 rounded-sm ${CATEGORY_COLOR[featuredPost.category] ?? "bg-zinc-600"
                }`}
            >
              {CATEGORY_LABEL[featuredPost.category] ?? featuredPost.category}
            </span>
          </div>
          <h1 className="text-white text-xl font-bold leading-tight mb-1 line-clamp-2">
            {featuredPost.title}
          </h1>
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3 flex-wrap">
            <span>{featuredPost.author_name}</span>
            <span>·</span>
            <span>{fmtDate(featuredPost.created_at)}</span>
            <span>·</span>
            <span>조회 {fmtNum(featuredPost.view_count)}</span>
          </div>

          {/* 시놉시스 */}
          {featuredPost.content && (
            <button
              className="w-full text-left mb-3"
              onClick={() => setIsExpanded((p) => !p)}
            >
              <p
                className={`text-zinc-300 text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-2"
                  }`}
              >
                {featuredPost.content}
              </p>
              {!isExpanded && (
                <span className="text-zinc-500 text-xs">더보기</span>
              )}
            </button>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center gap-6 mt-2">
            <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
              <Plus className="w-6 h-6" strokeWidth={2} />
              <span className="text-xs">담기</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
              <Share2 className="w-6 h-6" strokeWidth={2} />
              <span className="text-xs">공유</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 서비스 정보 카드 ── */}
      <div className="mx-4 mt-4 mb-2 flex items-center gap-3 bg-zinc-900 rounded-xl p-3">
        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm mb-0.5">
            WouldYouIn
          </p>
          <p className="text-zinc-400 text-xs leading-relaxed">
            학습 · 커뮤니티 · 공모전 · 채용
          </p>
          <p className="text-zinc-400 text-xs">AI 기반 서비스 빌더 플랫폼</p>
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
      </div>

      {/* ── 탭 섹션 ── */}
      <div className="mt-2">
        <TabSection>
          {(activeTab) => (
            <>
              {/* ─── 에피소드 탭 ─── */}
              {activeTab === "에피소드" && (
                <div>
                  {/* 카테고리 필터 */}
                  <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeCategory === cat.key
                          ? "bg-white text-black"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* 포스트 목록 */}
                  {isLoading ? (
                    <div className="flex flex-col gap-3 px-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-28 h-16 rounded bg-zinc-800" />
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-zinc-800 rounded w-3/4" />
                            <div className="h-2 bg-zinc-800 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center text-zinc-500 py-16 text-sm">
                      콘텐츠가 없습니다.
                    </div>
                  ) : (
                    posts.map((post, i) => (
                      <EpisodeCard
                        key={post.id}
                        episode={postToEpisode(post, i)}
                      />
                    ))
                  )}
                </div>
              )}

              {/* ─── 뉴진스 탭 ─── */}
              {activeTab === "뉴진스" && (
                <div>
                  {/* 팩트체크 배지 */}
                  <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 text-xs font-bold">✓ 팩트체크 완료</span>
                      <span className="text-zinc-400 text-xs">검증된 뉴스만 제공합니다</span>
                    </div>
                  </div>

                  {/* 카테고리 필터 */}
                  <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
                    {[
                      { key: "", label: "전체" },
                      { key: "tech", label: "기술" },
                      { key: "business", label: "비즈니스" },
                      { key: "politics", label: "정치" },
                      { key: "health", label: "건강" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveNewsCategory(cat.key)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          activeNewsCategory === cat.key
                            ? "bg-white text-black"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* 뉴스 목록 */}
                  {isLoading ? (
                    <div className="flex flex-col gap-3 px-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-28 h-20 rounded-lg bg-zinc-800" />
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-zinc-800 rounded w-3/4" />
                            <div className="h-2 bg-zinc-800 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : news.length === 0 ? (
                    <div className="text-center text-zinc-500 py-16 text-sm">
                      뉴스가 없습니다.
                    </div>
                  ) : (
                    <div className="px-4 space-y-4 pb-4">
                      {news.map((item) => (
                        <div
                          key={item.id}
                          className="border-b border-zinc-800 pb-4 last:border-0"
                        >
                          <div className="flex gap-3">
                            {item.thumbnail_url && (
                              <div className="w-28 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                <img
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-500 text-[10px] font-bold">✓ 검증됨</span>
                                {item.category && (
                                  <span className="text-zinc-500 text-[10px]">{item.category}</span>
                                )}
                              </div>
                              <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1">
                                {item.title}
                              </h3>
                              {item.summary && (
                                <p className="text-zinc-400 text-xs line-clamp-2 mb-2">
                                  {item.summary}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-zinc-500 text-[10px]">
                                <span>{item.source}</span>
                                <span>·</span>
                                <span>{fmtDate(item.published_at)}</span>
                                {item.fact_checker && (
                                  <>
                                    <span>·</span>
                                    <span>검증: {item.fact_checker}</span>
                                  </>
                                )}
                              </div>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── 추천 콘텐츠 탭 ─── */}
              {activeTab === "추천 콘텐츠" && (
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold text-base mb-3">
                    비슷한 콘텐츠
                  </p>
                  {recommended.length === 0 ? (
                    <p className="text-zinc-500 text-sm py-8 text-center">
                      추천 콘텐츠가 없습니다.
                    </p>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
                      {recommended.map((item) => (
                        <a
                          key={item.id}
                          href={item.link_url ?? "#"}
                          className="flex-shrink-0 w-28 cursor-pointer"
                        >
                          <div className="w-28 h-40 rounded-lg overflow-hidden bg-zinc-800 mb-1.5">
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-zinc-300 text-xs line-clamp-2">
                            {item.title}
                          </p>
                          {item.author_name && (
                            <p className="text-zinc-500 text-[10px] mt-0.5">
                              {item.author_name}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── 관련 쇼츠 탭 ─── */}
              {activeTab === "관련 쇼츠" && (
                <div className="grid grid-cols-2 gap-3 px-4 pt-4">
                  {shorts.length === 0 ? (
                    <div className="col-span-2 text-center text-zinc-500 py-12 text-sm">
                      숏폼이 없습니다.
                    </div>
                  ) : (
                    shorts.map((short) => (
                      <div
                        key={short.id}
                        className="rounded-xl overflow-hidden bg-zinc-900 relative cursor-pointer hover:ring-1 hover:ring-zinc-600 transition-all"
                      >
                        {/* 강조 라벨 */}
                        <div className="absolute top-0 left-0 right-0 p-2 z-10 bg-gradient-to-b from-black/80 to-transparent">
                          {short.highlight_sub && (
                            <p className="text-zinc-300 text-[10px] leading-tight">
                              {short.highlight_sub}
                            </p>
                          )}
                          {short.highlight_label && (
                            <p className="text-white font-bold text-sm leading-tight mt-0.5">
                              <span className="bg-indigo-600 px-1 rounded-sm">
                                {short.highlight_label}
                              </span>
                            </p>
                          )}
                        </div>
                        {/* 썸네일 */}
                        <div className="aspect-[9/16] max-h-52 overflow-hidden">
                          <img
                            src={short.thumbnail_url}
                            alt={short.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* 제목 + 조회수 */}
                        <div className="p-2">
                          <p className="text-zinc-300 text-xs leading-snug line-clamp-2">
                            <span className="text-white font-semibold text-[10px] mr-1">
                              WouldYouIn
                            </span>
                            {short.title}
                          </p>
                          <p className="text-zinc-500 text-[10px] mt-1">
                            조회 {fmtNum(short.view_count)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </TabSection>
      </div>
    </div>
  );
}
