'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface BoardPost {
  id: string;
  title: string;
  author: string;
  replies: number;
  created_at: string;
}

const BOARD_DRAFTS_KEY = "vding_board_posts";

const FALLBACK_POSTS: BoardPost[] = [
  { id: "seed_1", title: "원격 근무 가능한 회사 추천 부탁드려요", author: "seoyeon.park", replies: 7, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "seed_2", title: "프론트엔드 커리어 전환 고민입니다 (비전공자)", author: "minho_lee", replies: 4, created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
  { id: "seed_3", title: "서울에서 사이드 프로젝트 같이 하실 분 계신가요", author: "jihye.kim", replies: 12, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "seed_4", title: "면접 과제 준비 팁 공유합니다", author: "dabin.dev", replies: 5, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "seed_5", title: "신입 백엔드 포트폴리오 피드백 부탁드려요", author: "jiwon.choi", replies: 9, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "seed_6", title: "요즘 협업 툴은 어떤 조합으로 쓰시나요?", author: "taeho.song", replies: 3, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "seed_7", title: "커뮤니티 스터디 시작 전에 체크할 것들", author: "yuna.jung", replies: 6, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
];

function sanitizeText(value: string): string {
  return value.replace(/dummy[_\s]*/gi, "").replace(/\s{2,}/g, " ").trim();
}

function readLocalPosts(): BoardPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOARD_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dedupeBoardPosts(items: BoardPost[]): BoardPost[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title}|${item.author}|${item.created_at}`;
    if (!item.title || !item.author || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function BoardPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const localPosts = readLocalPosts();
        const res = await fetch("/api/community/board");
        const data = await res.json();
        const fetched: BoardPost[] = (data.data ?? []) as BoardPost[];

        const normalized = fetched.map((post, idx) => ({
          id: post.id || `board_${idx}`,
          title: sanitizeText(post.title ?? "제목 없음"),
          author: sanitizeText(post.author ?? "익명"),
          replies: Number.isFinite(post.replies) ? post.replies : 0,
          created_at: post.created_at || new Date().toISOString(),
        }));

        const meaningful = dedupeBoardPosts(normalized);
        const base = meaningful.length >= 7 ? meaningful.slice(0, 7) : FALLBACK_POSTS;
        const merged = dedupeBoardPosts(
          [...localPosts, ...base].map((post) => ({
            ...post,
            title: sanitizeText(post.title),
            author: sanitizeText(post.author),
          }))
        );

        if (!cancelled) {
          setPosts(merged);
        }
      } catch (err) {
        console.warn("[Board API] 백엔드 미연결:", (err as Error).message);
        if (!cancelled) {
          setPosts([...readLocalPosts(), ...FALLBACK_POSTS]);
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

  const filtered = posts.filter(
    (p) => p.title.includes(keyword) || p.author.includes(keyword),
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 pt-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="게시글 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none"
          />
          <button
            className="px-3 py-2 bg-black text-white text-sm rounded-lg"
            onClick={() => router.push("/community/board/write")}
          >
            글쓰기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <MessageSquare className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/community/board/${encodeURIComponent(post.id)}`}
              className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-semibold mb-1">{post.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>{post.author}</span>
                <span>·</span>
                <span>
                  {post.created_at
                    ? formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })
                    : ""}
                </span>
                <span>·</span>
                <span>댓글 {post.replies}개</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
