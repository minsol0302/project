'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BOARD_LOCAL_AUTHOR_NAME } from "../board-data";

const BOARD_DRAFTS_KEY = "vding_board_posts";

interface BoardPostDraft {
  id: string;
  title: string;
  author: string;
  replies: number;
  created_at: string;
}

function readLocalPosts(): BoardPostDraft[] {
  try {
    const raw = localStorage.getItem(BOARD_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardPostDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function BoardWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(BOARD_LOCAL_AUTHOR_NAME);

  const isDisabled = !title.trim() || !content.trim() || !author.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isDisabled) return;

    const nextPost: BoardPostDraft = {
      id: `local_${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      replies: 0,
      created_at: new Date().toISOString(),
    };

    const prev = readLocalPosts();
    localStorage.setItem(BOARD_DRAFTS_KEY, JSON.stringify([nextPost, ...prev]));
    router.push("/community/board");
  }

  return (
    <div className="bg-white min-h-screen px-4 py-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold">게시글 작성</h1>
        <p className="text-xs text-gray-500 mt-1">작성 후 등록하면 게시판 상단에 바로 표시됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="작성자"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={10}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 resize-none"
        />

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isDisabled}
            className="flex-1 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
