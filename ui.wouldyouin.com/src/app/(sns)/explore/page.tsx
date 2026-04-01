'use client';

import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, X, ExternalLink, Hash, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// 환경에 맞는 백엔드 URL 결정
const BACKEND = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.wouldyouin.com")
  : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  category?: string;
  desc?: string;
  color?: string;
  // Post result fields
  thumbnail_url?: string | null;
  hashtags?: string[];
  username?: string;
  avatar_url?: string | null;
  created_at?: string;
  result_type: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  sns:          "SNS",
  messaging:    "\uba54\uc2e0\uc800",
  community:    "\ucee4\ubba4\ub2c8\ud2f0",
  ecommerce:    "\uc774\ucee4\uba38\uc2a4",
  productivity: "\uc0dd\uc0b0\uc131",
  edtech:       "\uc5d0\ub4c0\ud14c\ud06c",
  health:       "\ud5ec\uc2a4",
  fintech:      "\ud540\ud14c\ud06c",
  esg:          "ESG",
  marketing:    "\ub9c8\ucf00\ud305",
};

const HOT_KEYWORDS = ["SNS", "\ud540\ud14c\ud06c", "\uc5d0\ub4c0\ud14c\ud06c", "\ucee4\ubba4\ub2c8\ud2f0", "\uac74\uac15", "\ub9c8\ucf00\ud305"];

export default function ExplorePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<SearchResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  useEffect(() => {
    fetchSearch("");
  }, []);

  async function fetchSearch(q: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data ?? []);
      }
    } catch (err) {
      console.warn("[Explore] search error:", err);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function handleSearch() {
    fetchSearch(query.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  function handleClear() {
    setQuery("");
    setSearched(false);
    fetchSearch("");
    inputRef.current?.focus();
  }

  function handleHotKeyword(kw: string) {
    setQuery(kw);
    fetchSearch(kw);
  }

  const toSrc = (url: string) => {
    // S3 URL은 그대로 사용
    if (url.startsWith("https://")) return url;
    // 로컬 경로는 백엔드 URL 추가 (하위 호환성)
    if (url.startsWith("/data/")) return BACKEND + url;
    return url;
  };

  // Separate items and posts
  const itemResults = results.filter((r) => r.result_type === "item" || !r.result_type);
  const postResults = results.filter((r) => r.result_type === "post");

  return (
    <div className="bg-white min-h-screen flex flex-col">

      {/* ── Header ── */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-20 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{"\ud0d0\uc0c9"}</span>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={"\uc11c\ube44\uc2a4, \ud574\uc2dc\ud0dc\uadf8, \ud0a4\uc6cc\ub4dc \uac80\uc0c9"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            title={"\uac80\uc0c9"}
          >
            <Search className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={() => router.push("/vding/chatbot")}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold shadow hover:opacity-90 active:scale-95 transition whitespace-nowrap"
            title="AI V\ub85c \uac80\uc0c9"
          >
            <Sparkles className="w-4 h-4" />
            AI&nbsp;V
          </button>
        </div>

        {/* Hot keywords */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {HOT_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleHotKeyword(kw)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                query === kw
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400">{"\uac80\uc0c9 \uc911\u2026"}</p>
          </div>
        ) : results.length === 0 && searched ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            <Search className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-400">
              {"\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}
              <br />
              {"\ub2e4\ub978 \ud0a4\uc6cc\ub4dc\ub85c \uc2dc\ub3c4\ud574 \ubcf4\uc138\uc694."}
            </p>
            <button
              onClick={() => router.push("/vding/chatbot")}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold shadow"
            >
              <Sparkles className="w-4 h-4" />
              AI V{"\uc5d0\uac8c \ubb3c\uc5b4\ubcf4\uae30"}
            </button>
          </div>
        ) : (
          <>
            {searched && (
              <p className="text-xs text-gray-400 mb-3">
                {query ? `"${query}" ` : "\uc804\uccb4 "}
                {"\uac80\uc0c9 \uacb0\uacfc"} {results.length}{"\uac74"}
              </p>
            )}

            {/* ── Post results (hashtag search) ── */}
            {postResults.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {"\uac8c\uc2dc\ubb3c"} ({postResults.length})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {postResults.map((post) => {
                    const thumbSrc = post.thumbnail_url
                      ? toSrc(post.thumbnail_url)
                      : null;
                    return (
                      <div
                        key={post.id}
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                      >
                        {thumbSrc ? (
                          <Image
                            src={thumbSrc}
                            alt={post.title || "post"}
                            fill
                            sizes="(max-width: 448px) 33vw, 149px"
                            className="object-cover group-hover:opacity-80 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Hash className="w-6 h-6" />
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                          <div className="flex items-center gap-1">
                            {post.avatar_url ? (
                              <Image
                                src={toSrc(post.avatar_url)}
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4 rounded-full"
                              />
                            ) : (
                              <User className="w-3 h-3 text-white" />
                            )}
                            <span className="text-white text-[10px] font-medium truncate">
                              {post.username}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Hashtag chips from posts */}
                {query && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(new Set(postResults.flatMap((p) => p.hashtags ?? []))).slice(0, 10).map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(tag.replace("#", "")); fetchSearch(tag.replace("#", "")); }}
                        className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Item results ── */}
            {itemResults.length > 0 && (
              <>
                {postResults.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {"\uc11c\ube44\uc2a4"} ({itemResults.length})
                    </span>
                  </div>
                )}
                <div className="space-y-3">
                  {itemResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition cursor-pointer"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: item.color ?? "#888" }}
                      >
                        {CATEGORY_LABELS[item.category ?? ""]?.slice(0, 2) ?? "??"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {item.desc}
                        </p>
                        <span
                          className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: (item.color ?? "#888") + "22", color: item.color ?? "#888" }}
                        >
                          {CATEGORY_LABELS[item.category ?? ""] ?? item.category}
                        </span>
                      </div>

                      <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* AI V banner */}
            <button
              onClick={() => router.push("/vding/chatbot")}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              {"\uc6d0\ud558\ub294 \uc11c\ube44\uc2a4\ub97c AI V\uc5d0\uac8c \uc9c1\uc811 \ubb3c\uc5b4\ubcf4\uae30"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
