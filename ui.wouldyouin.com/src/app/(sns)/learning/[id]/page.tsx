'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import Image from "next/image";
import { useLearningProgressStore } from "@/app/store/useLearningProgressStore";

interface LearningDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  author: string;
  duration_min: number;
  content?: string;
  video_url?: string;
}

export default function LearningDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<LearningDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    // 학습 콘텐츠와 진행 상태를 동시에 로드
    Promise.all([
      fetch(`/api/learning/${id}`),
      fetch(`/api/learning/${id}/progress`).catch(() => null),
    ])
      .then(async ([contentRes, progressRes]) => {
        if (!contentRes.ok) {
          console.error("[LearningDetail] API error:", contentRes.status, contentRes.statusText);
          return;
        }
        
        const contentData = await contentRes.json();
        if (contentData.success && contentData.data) {
          setItem(contentData.data);
        } else {
          console.error("[LearningDetail] Invalid response:", contentData);
        }
        
        // 진행 상태 로드
        if (progressRes && progressRes.ok) {
          try {
            const progressData = await progressRes.json();
            if (progressData.success) {
              setProgress(progressData.data);
            }
          } catch (err) {
            console.error("[LearningDetail] 진행 상태 파싱 실패:", err);
          }
        }
      })
      .catch((err) => {
        console.error("[LearningDetail] 로드 실패:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <BookOpen className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-sm">콘텐츠를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // YouTube/Vimeo URL에서 embed URL로 변환
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 네이버 프리미엄 컨텐츠 형식 */}
      <article className="max-w-3xl mx-auto">
        {/* 썸네일 */}
        {item.thumbnail_url && (
          <div className="relative w-full aspect-video bg-gray-100">
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 본문 */}
        <div className="px-4 py-6 space-y-4">
          {/* 카테고리 */}
          {item.category && (
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              {item.category}
            </span>
          )}

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {item.author && <span>#{item.author}</span>}
            {item.duration_min > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.duration_min}분
              </span>
            )}
          </div>

          {/* 설명 */}
          {item.description && (
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          )}

          {/* 동영상 */}
          {item.video_url && (
            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                src={getEmbedUrl(item.video_url)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* 본문 콘텐츠 */}
          {item.content && (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}

          {/* 이어서 학습하기 버튼 */}
          <div className="pt-6">
            <button
              onClick={() => {
                // Store에 현재 콘텐츠 설정 후 학습 페이지로 이동
                useLearningProgressStore.getState().setCurrentContent(id);
                router.push(`/learning/${id}/study`);
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              {progress?.last_stage_id && progress?.last_step_id 
                ? `이어서 학습하기 (${progress.progress_pct || 0}% 완료)` 
                : '학습 시작하기'}
            </button>
            {progress?.last_stage_id && progress?.last_step_id && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                마지막 학습 위치: {progress.last_stage_id} - {progress.last_step_id}
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
