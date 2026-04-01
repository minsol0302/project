"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface ScheduleItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  project_name?: string;
  learning_title?: string;
}

export function ScheduleCarousel() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 일정 데이터 가져오기 (일주일 단위)
  const fetchSchedules = async () => {
    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      
      const res = await fetch(`/api/schedule/week?start_date=${startDate}`, {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSchedules(
            data.schedules.map((s: any) => ({
              id: s.id,
              date: s.date,
              title: s.title,
              description: s.description,
              project_name: s.project_name,
              learning_title: s.learning_title,
            }))
          );
          // 일주일 이상의 일정이 있는지 확인 (더보기 버튼 표시용)
          setHasMore(data.schedules.length >= 7);
        }
      }
    } catch (err) {
      console.error("[ScheduleCarousel] 일정 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    
    // 페이지 포커스 시 일정 다시 로드 (Schedule 페이지에서 돌아올 때)
    const handleFocus = () => {
      fetchSchedules();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // storage 이벤트 리스너 (다른 탭에서 일정 추가 시)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'schedule_updated') {
        fetchSchedules();
        // 이벤트 처리 후 storage 키 제거
        localStorage.removeItem('schedule_updated');
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < schedules.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 모바일 스와이프 처리
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // 스크롤 위치에 따라 인덱스 업데이트
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth - 16; // gap 제외
      const newIndex = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(Math.min(newIndex, schedules.length - 1));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // 스크롤 위치에 따라 인덱스 업데이트
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth - 16; // gap 제외
      const newIndex = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(Math.min(newIndex, schedules.length - 1));
    }
  };

  // currentIndex 변경 시 스크롤 위치 업데이트
  useEffect(() => {
    if (scrollContainerRef.current && !isDragging) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth - 16; // gap 제외
      container.scrollTo({
        left: currentIndex * cardWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex, isDragging]);

  return (
    <div className="relative border-b border-gray-200">
      {/* 화살표 버튼 (데스크톱) */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
          aria-label="이전 일정"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}
      {currentIndex < schedules.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
          aria-label="다음 일정"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* 일정 카드 컨테이너 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* + 버튼 (일정 추가) - 인스타 스토리 스타일 */}
        <div className="flex-shrink-0 w-20 h-20 snap-start">
          <button
            onClick={() => router.push("/schedule")}
            className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1"
          >
            <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-gray-600 leading-tight text-center px-1">일정 추가</span>
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="flex-shrink-0 w-20 h-20 snap-start">
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 w-full h-full flex items-center justify-center">
              <p className="text-[9px] text-gray-400 text-center leading-tight">
                등록된 일정이 없습니다
              </p>
            </div>
          </div>
        ) : (
          schedules.map((schedule, index) => (
          <div
            key={schedule.id}
            className="flex-shrink-0 w-20 h-20 snap-start"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100 w-full h-full flex flex-col">
              <span className="text-[9px] font-medium text-blue-600 mb-0.5 leading-tight">
                {new Date(schedule.date).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <h3 className="font-semibold text-[10px] text-gray-900 mb-0.5 line-clamp-2 leading-tight">
                {schedule.title}
              </h3>
              {schedule.description && (
                <p className="text-[9px] text-gray-600 line-clamp-1 flex-1 leading-tight">
                  {schedule.description}
                </p>
              )}
              <div className="mt-auto">
                {schedule.project_name && (
                  <p className="text-[8px] text-gray-500 truncate leading-tight">
                    📁
                  </p>
                )}
                {schedule.learning_title && (
                  <p className="text-[8px] text-gray-500 truncate leading-tight">
                    📚
                  </p>
                )}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="px-4 pb-3 flex justify-center">
          <button
            onClick={() => router.push("/schedule")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            더보기
          </button>
        </div>
      )}

      {/* 인디케이터 */}
      {schedules.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-2">
          {schedules.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-blue-500"
                  : "w-1.5 bg-gray-300"
              }`}
              aria-label={`일정 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
