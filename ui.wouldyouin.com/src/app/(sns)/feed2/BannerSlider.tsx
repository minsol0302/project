"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string; // "ONLY", "NEW" 등
  badgeColor?: string; // "red" | "blue" | "green"
  linkUrl?: string;
  isActive: boolean;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number; // ms, 기본 5000
}

export default function BannerSlider({
  banners,
  autoPlayInterval = 5000,
}: BannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeBanners = banners.filter((b) => b.isActive);
  const total = activeBanners.length;

  const goNext = useCallback(() => {
    if (total === 0) return;
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = () => {
    if (total === 0) return;
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  // 자동 슬라이드
  useEffect(() => {
    if (isPaused || total <= 1) return;
    timerRef.current = setInterval(goNext, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total, goNext, autoPlayInterval]);

  // 터치/마우스 스와이프
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    setIsDragging(true);
    setIsPaused(true);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const diff = startX.current - e.clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    setIsDragging(false);
    setIsPaused(false);
  };

  if (total === 0) return null;

  const banner = activeBanners[Math.min(current, total - 1)];
  const badgeBg =
    banner.badgeColor === "blue"
      ? "bg-blue-600"
      : banner.badgeColor === "green"
      ? "bg-green-600"
      : "bg-red-600";

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ aspectRatio: "16/9", maxHeight: "480px" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setIsDragging(false);
        setIsPaused(false);
      }}
    >
      {/* 배너 이미지 */}
      <div className="absolute inset-0">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover transition-all duration-500"
          draggable={false}
        />
        {/* 하단 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 z-10">
        {banner.badge && (
          <span
            className={`inline-block ${badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm mb-2 tracking-wider`}
          >
            {banner.badge}
          </span>
        )}
        <h2 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
            {banner.subtitle}
          </p>
        )}
      </div>

      {/* 좌우 화살표 (데스크탑) */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors hidden md:flex"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors hidden md:flex"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}

      {/* 점 네비게이션 */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setIsPaused(false);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* 진행 바 (타이머 시각화) */}
      {total > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            key={`${current}-progress`}
            className="h-full bg-white/60"
            style={{
              animation: `progress ${autoPlayInterval}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

