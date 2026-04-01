'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, User, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 환경에 맞는 백엔드 URL 결정
const BACKEND = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.wouldyouin.com")
  : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

interface PostDetail {
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/post/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setPost(data.post);
          setLikes(data.post.like_count || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-500">게시물을 찾을 수 없습니다</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-500"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const imgs: string[] = Array.isArray(post.image_urls)
    ? post.image_urls
    : typeof post.image_urls === "string"
      ? (() => { try { const p = JSON.parse(post.image_urls); return Array.isArray(p) ? p : []; } catch { return []; } })()
      : [];
  const toSrc = (url: string) => {
    // S3 URL은 그대로 사용
    if (url.startsWith("https://")) return url;
    // 로컬 경로는 백엔드 URL 추가 (하위 호환성)
    if (url.startsWith("/data/")) return BACKEND + url;
    return url;
  };
  const avatarSrc = post.user.avatar_url ? toSrc(post.user.avatar_url) : null;
  const hashtags: string[] = Array.isArray(post.hashtags) ? post.hashtags : [];

  const toggleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes((v) => (wasLiked ? v - 1 : v + 1));
    try {
      const res = await fetch(`/api/social?path=${wasLiked ? "unlike" : "like"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.like_count === "number") {
          setLikes(data.like_count);
        }
      }
    } catch {
      setIsLiked(wasLiked);
      setLikes((v) => (wasLiked ? v + 1 : v - 1));
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">게시물</h2>
        <div className="w-6" />
      </div>

      {/* Post */}
      <article>
        <div className="flex items-center justify-between px-4 py-2">
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
          <button aria-label="More options">
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {imgs.length > 0 && (
          <div className="relative w-full aspect-square bg-gray-100">
            <Image
              src={toSrc(imgs[imgIdx])}
              alt="post"
              fill
              sizes="100vw"
              className="object-cover"
              priority
              onDoubleClick={() => {
                if (!isLiked) toggleLike();
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

        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                aria-label={isLiked ? "Unlike" : "Like"}
                onClick={toggleLike}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              <button aria-label="Comment">
                <MessageCircle className="w-6 h-6" aria-hidden="true" />
              </button>
              <button aria-label="Share">
                <Send className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <button aria-label="Save">
              <Bookmark className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          {likes > 0 && (
            <p className="font-semibold text-sm mb-1">좋아요 {likes}개</p>
          )}
          {post.caption && (
            <div className="text-sm mb-1">
              <button
                onClick={() => router.push(`/profile?user_id=${post.user.id}`)}
                className="font-semibold mr-2"
              >
                {post.user.username}
              </button>
              <span>{post.caption}</span>
            </div>
          )}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {hashtags.map((tag, i) => (
                <span key={i} className="text-xs text-blue-500 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-gray-500 mt-1">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </p>
        </div>
      </article>
    </div>
  );
}
