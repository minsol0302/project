"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

import {
  MessageCircle,
  Bookmark,
  User,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { UserProfileHeader } from "../../components/UserProfileHeader";
import { ScheduleCarousel } from "../../components/ScheduleCarousel";
import { useAuthStore } from "../../store/useAuthStore";

// 환경에 맞는 백엔드 URL 결정
const BACKEND = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.wouldyouin.com")
  : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

/* ── types ── */
interface RealPost {
  id: string;
  image_urls: string[];
  thumbnail_url: string | null;
  caption: string | null;
  location: string | null;
  filter: string;
  hashtags: string[];
  like_count: number;
  created_at: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar_url: string | null;
  };
}

interface FeedPage {
  posts: RealPost[];
  count: number;
  has_more: boolean;
  page: number;
}

/* ── fetch ── */
const PAGE_SIZE = 3; // 3개씩 로드

async function fetchFeedPage({
  pageParam = 1,
}: {
  pageParam?: number;
}): Promise<FeedPage> {
  const res = await fetch(`/api/feed/posts?page=${pageParam}&size=${PAGE_SIZE}`);
  if (!res.ok) return { posts: [], count: 0, has_more: false, page: pageParam };
  return res.json();
}

/* ── main component ── */
export default function FeedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["feed-posts"],
    queryFn: fetchFeedPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  /* ── IntersectionObserver ── */
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ── Prefetch ── */
  const prefetchNextPage = useCallback(() => {
    if (!data || !hasNextPage || isFetchingNextPage) return;
    const nextPage = (data.pages.at(-1)?.page ?? 0) + 1;
    queryClient.prefetchInfiniteQuery({
      queryKey: ["feed-posts"],
      queryFn: fetchFeedPage,
      initialPageParam: nextPage,
    });
  }, [data, hasNextPage, isFetchingNextPage, queryClient]);

  useEffect(() => {
    prefetchNextPage();
  }, [prefetchNextPage]);

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="bg-white min-h-screen">
      <UserProfileHeader />
      <ScheduleCarousel />
      <div className="divide-y divide-gray-100">
        {allPosts.map((post, idx) => (
          <RealPostCard key={post.id} post={post} isPriority={idx < 2} />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {!hasNextPage && allPosts.length > 0 && !isLoading && (
        <div className="flex justify-center py-8">
          <p className="text-xs text-gray-300">All posts loaded</p>
        </div>
      )}
    </div>
  );
}

/* ── RealPostCard ── */
const RealPostCard = memo(function RealPostCard({
  post,
  isPriority,
}: {
  post: RealPost;
  isPriority: boolean;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Array<{id: string; username: string; text: string; created_at: string}>>([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnPost, setIsOwnPost] = useState(false);

  const rawImgs = post.image_urls;
  const imgs: string[] = Array.isArray(rawImgs)
    ? rawImgs
    : typeof rawImgs === "string"
      ? (() => { try { const p = JSON.parse(rawImgs); return Array.isArray(p) ? p : []; } catch { return []; } })()
      : [];
  
  // 디버깅: 이미지 URL 확인
  useEffect(() => {
    if (imgs.length > 0) {
      console.log("[Feed] Post ID:", post.id, "Image URLs:", imgs);
      imgs.forEach((url, idx) => {
        // S3 URL 유효성 검사
        if (url && url.startsWith("https://")) {
          const isS3Url = url.includes("s3.amazonaws.com") || url.includes("s3.ap-northeast-2.amazonaws.com");
          if (isS3Url) {
            console.log(`[Feed] Image ${idx + 1} S3 URL:`, url);
          } else {
            console.warn(`[Feed] Image ${idx + 1} is HTTPS but not S3:`, url);
          }
        } else if (url) {
          console.warn(`[Feed] Image ${idx + 1} invalid URL format:`, url);
        }
      });
    } else {
      console.warn("[Feed] Post ID:", post.id, "has no images");
    }
  }, [post.id, imgs]);
  
  const toSrc = (url: string) => {
    if (!url) {
      console.warn("[Feed] Empty URL provided to toSrc");
      return "";
    }
    // S3 URL은 그대로 사용
    if (url.startsWith("https://")) {
      return url;
    }
    // 로컬 경로는 백엔드 URL 추가 (하위 호환성)
    if (url.startsWith("/data/")) {
      const fullUrl = BACKEND + url;
      return fullUrl;
    }
    console.warn("[Feed] Unknown URL format:", url);
    return url;
  };
  const avatarSrc = post.user.avatar_url ? toSrc(post.user.avatar_url) : null;
  // 해시태그 파싱 - JSONB 배열 또는 문자열 배열 처리
  const rawTags = post.hashtags;
  let hashtags: string[] = [];
  if (Array.isArray(rawTags)) {
    hashtags = rawTags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
  } else if (typeof rawTags === 'string') {
    try {
      const parsed = JSON.parse(rawTags);
      hashtags = Array.isArray(parsed) ? parsed.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0) : [];
    } catch {
      hashtags = [];
    }
  }

  // 게시물이 긴지 확인 (100자 이상)
  const isLongCaption = post.caption ? post.caption.length > 100 : false;
  const displayCaption = isLongCaption && !isExpanded && post.caption
    ? post.caption.slice(0, 100) + "..."
    : post.caption;

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      const res = await fetch(`/api/social?path=comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, text: commentText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
      }
    } catch (err) {
      console.error("[Feed] 댓글 작성 실패:", err);
    }
  };

  // 자신의 게시물인지 확인
  useEffect(() => {
    setIsOwnPost(user?.id === post.user.id);
  }, [user?.id, post.user.id]);

  // 댓글 로드
  useEffect(() => {
    if (showComments) {
      fetch(`/api/social?path=comments&post_id=${post.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.comments) {
            setComments(data.comments);
          }
        })
        .catch(() => {});
    }
  }, [showComments, post.id]);

  // 팔로우 처리
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnPost) return;
    
    try {
      const res = await fetch(`/api/social?path=${isFollowing ? "unfollow" : "follow"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: post.user.id }),
      });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error("[Feed] 팔로우 실패:", err);
    }
  };

  // 모바일에서 높이 제한은 긴 게시물에만 적용
  const needsMinHeight = isLongCaption && !isExpanded;

  return (
    <article className="mb-4 md:mb-6">
      <div className={`${needsMinHeight ? "min-h-[calc(100vh-120px)]" : ""} md:min-h-0 flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-2 md:py-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => router.push(`/profile?user_id=${post.user.id}`)}
              className="flex items-center gap-3"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={post.user.username}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{post.user.username}</p>
                {post.location && (
                  <p className="text-[11px] text-gray-500">{post.location}</p>
                )}
              </div>
            </button>
            {!isOwnPost && (
              <button
                onClick={handleFollow}
                className={`ml-auto flex items-center justify-center w-7 h-7 rounded-full border transition ${
                  isFollowing
                    ? "border-gray-300 bg-gray-50 text-gray-700"
                    : "border-blue-500 bg-blue-500 text-white"
                }`}
                aria-label={isFollowing ? "언팔로우" : "팔로우"}
              >
                <UserPlus className={`w-4 h-4 ${isFollowing ? "text-gray-600" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {imgs.length > 0 && imgs[imgIdx] && (
          <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
            <img
              src={toSrc(imgs[imgIdx])}
              alt="post"
              width={800}
              height={800}
              className="w-full h-full object-cover"
              loading={isPriority ? "eager" : "lazy"}
              onDoubleClick={() => {}}
              onError={(e) => {
                const imgUrl = toSrc(imgs[imgIdx]);
                const target = e.target as HTMLImageElement;
                console.error("[Feed] Image load error:", {
                  url: imgUrl,
                  postId: post.id,
                  imageIndex: imgIdx,
                  error: e,
                  naturalWidth: target.naturalWidth,
                  naturalHeight: target.naturalHeight,
                });
                // 에러 시 이미지 숨김 처리
                target.style.display = 'none';
              }}
              onLoad={(e) => {
                console.log("[Feed] Image loaded successfully:", toSrc(imgs[imgIdx]));
                const img = e.target as HTMLImageElement;
                console.log("[Feed] Image dimensions:", img.naturalWidth, "x", img.naturalHeight);
                console.log("[Feed] Rendered size:", img.offsetWidth, "x", img.offsetHeight);
              }}
            />
            {imgs.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImgIdx((i) => (i - 1 + imgs.length) % imgs.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg z-10"
                >
                  &#8249;
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % imgs.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg z-10"
                >
                  &#8250;
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {imgs.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i === imgIdx ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="px-4 py-2 md:py-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button 
                aria-label="Comment"
                onClick={() => {
                  setShowComments(!showComments);
                  // 댓글 입력창 포커스
                  setTimeout(() => {
                    const commentInput = document.getElementById(`comment-input-${post.id}`);
                    if (commentInput) {
                      commentInput.focus();
                      commentInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }
                  }, 100);
                }}
              >
                <MessageCircle className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <button aria-label={isSaved ? "Unsave" : "Save"} onClick={() => setIsSaved(!isSaved)}>
              <Bookmark className={`w-6 h-6 ${isSaved ? "fill-black" : ""}`} aria-hidden="true" />
            </button>
          </div>
          {comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-gray-500 mb-1 hover:text-gray-700"
            >
              댓글 {comments.length}개 {showComments ? "숨기기" : "보기"}
            </button>
          )}
          {post.caption && (
            <div className="text-sm mb-1 flex-1">
              <button
                onClick={() => router.push(`/profile?user_id=${post.user.id}`)}
                className="font-semibold mr-2 hover:underline"
              >
                {post.user.username}
              </button>
              <span className={isLongCaption && !isExpanded ? "" : ""}>
                {displayCaption}
              </span>
              {isLongCaption && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-500 ml-1 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      접기
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    </>
                  ) : (
                    <>
                      더 보기
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hashtags.map((tag, i) => {
                // 해시태그 정리: # 제거 후 다시 추가 (일관성 유지)
                const cleanTag = typeof tag === 'string' ? tag.trim().replace(/^#+/, '') : String(tag).trim().replace(/^#+/, '');
                if (!cleanTag) return null;
                return (
                  <span key={i} className="text-xs text-blue-500 font-medium hover:text-blue-600 cursor-pointer">
                    #{cleanTag}
                  </span>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-gray-500 mt-1">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </p>

          {/* 댓글 섹션 */}
          {showComments && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <span className="font-semibold mr-2">{comment.username}</span>
                  <span>{comment.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* 댓글 입력 */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="flex gap-2">
              <input
                id={`comment-input-${post.id}`}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="px-3 py-1.5 text-sm text-blue-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                게시
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});
