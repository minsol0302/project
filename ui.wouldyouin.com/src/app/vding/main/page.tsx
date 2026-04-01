"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVdingStore } from "@/app/store/useVdingStore";

export default function VdingMainPage() {
  const router = useRouter();
  const { setProject } = useVdingStore();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vding/main", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_text: idea.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail ?? data.error ?? "오류가 발생했습니다.");
        return;
      }

      const data = await res.json();
      // project_id를 URL에 노출하지 않고 store(sessionStorage)에 저장
      setProject({
        projectId:  data.project_id,
        ideaText:   idea.trim(),
        categoryId: "",
        themeId:    "",
      });
      router.push("/vding/category");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            아이디어만으로 나만의 웹/앱을 만들어보세요
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            안녕하세요, 아이디어만으로 나만의 웹/앱을 만들어보세요.
            <br />
            아래에 내가 만들고자 하는 서비스의 내용을 적어주세요.
          </p>
        </div>

        {/* 채팅형 입력 섹션 */}
        <div className="border border-gray-200 rounded-2xl bg-gray-50 p-4 shadow-sm">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="예: SNS 커뮤니티 앱, 맛집 추천 서비스, 일정 관리 앱..."
            rows={5}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed"
          />

          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}

          {/* 하단 버튼 바 */}
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={!idea.trim() || loading}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center transition"
            >
              {loading ? (
                <span className="text-xs">...</span>
              ) : (
                "V"
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          로그인한 계정의 아이디어로 저장됩니다
        </p>
      </div>
    </div>
  );
}
