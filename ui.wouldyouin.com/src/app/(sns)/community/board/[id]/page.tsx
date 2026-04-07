'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  getBoardPostDetail,
  BOARD_EXTRA_COMMENTS_KEY_PREFIX,
  BOARD_LOCAL_AUTHOR_NAME,
  type BoardComment,
} from "../board-data";

function readExtraComments(postId: string): BoardComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOARD_EXTRA_COMMENTS_KEY_PREFIX + postId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeExtraComments(postId: string, list: BoardComment[]) {
  localStorage.setItem(BOARD_EXTRA_COMMENTS_KEY_PREFIX + postId, JSON.stringify(list));
}

export default function BoardPostDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const detail = useMemo(() => (id ? getBoardPostDetail(id) : undefined), [id]);

  const [extraComments, setExtraComments] = useState<BoardComment[]>([]);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!id) return;
    setExtraComments(readExtraComments(id));
    setHydrated(true);
  }, [id]);

  const comments = useMemo(() => {
    if (!detail) return [];
    const merged = [...detail.initialComments, ...extraComments];
    return merged.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [detail, extraComments]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text || !id || !detail) return;

    const next: BoardComment = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      author: BOARD_LOCAL_AUTHOR_NAME,
      body: text,
      created_at: new Date().toISOString(),
    };
    const list = [...extraComments, next];
    setExtraComments(list);
    writeExtraComments(id, list);
    setDraft("");
  }, [draft, id, detail, extraComments]);

  if (!id) {
    return (
      <div className="p-4 text-sm text-gray-500">잘못된 경로입니다.</div>
    );
  }

  if (!detail) {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-600">게시글을 찾을 수 없습니다.</p>
        <Link href="/community/board" className="text-sm text-blue-600 underline">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-8">
      <div className="px-4 pt-3 pb-4 border-b border-gray-200">
        <Link
          href="/community/board"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
        <h1 className="text-base font-semibold text-black leading-snug">{detail.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500">
          <span>{detail.author}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(detail.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>
      </div>

      <article className="px-4 py-4">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{detail.body}</p>
      </article>

      <div className="px-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-black mb-3">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          댓글 {comments.length}개
        </div>

        <ul className="space-y-4 mb-6">
          {comments.map((c) => (
            <li key={c.id} className="text-sm">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                <span className="font-medium text-gray-700">{c.author}</span>
                <span>·</span>
                <span>
                  {formatDistanceToNow(new Date(c.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{c.body}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-gray-200 p-3">
          <label className="sr-only" htmlFor="board-comment">
            댓글 작성
          </label>
          <textarea
            id="board-comment"
            rows={3}
            placeholder={hydrated ? "댓글을 입력하세요" : "불러오는 중…"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!hydrated}
            className="w-full text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none disabled:opacity-50"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={submit}
              disabled={!hydrated || !draft.trim()}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
