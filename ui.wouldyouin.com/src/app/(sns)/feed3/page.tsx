"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import BannerSlider, { Banner } from "./BannerSlider";
import EpisodeCard, { Episode } from "./EpisodeCard";
import TabSection from "./TabSection";

// ── 목 데이터 ──────────────────────────────────────────────────────────────
const MOCK_BANNERS: Banner[] = [
  {
    id: "1",
    title: "VDing - 아이디어만 입력하면 프로젝트가 완성됩니다",
    subtitle: "AI 기반 서비스 빌더 플랫폼. SNS, EdTech, FinTech 등 다양한 UI 테마를 선택하고 즉시 프로젝트를 시작하세요",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    badge: "NEW",
    badgeColor: "blue",
    isActive: true,
  },
  {
    id: "2",
    title: "VDing - 7가지 카테고리, 30+ UI 테마",
    subtitle: "SNS, EdTech, Messaging, FinTech, Community, ESG 등 원하는 카테고리를 선택하고 Instagram, TikTok, Duolingo 스타일의 UI를 즉시 생성하세요",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    badge: "HOT",
    badgeColor: "red",
    isActive: true,
  },
  {
    id: "3",
    title: "VDing - 코딩 없이 서비스를 만드세요",
    subtitle: "아이디어 입력부터 UI 테마 선택, 프로젝트 대시보드까지. 개발 지식 없이도 나만의 서비스를 빠르게 구축할 수 있습니다",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    badge: "ONLY",
    badgeColor: "green",
    isActive: true,
  },
];

// ── 추천 탭 데이터 ──
const MOCK_RECOMMENDED: Episode[] = [
  {
    id: "rec1", number: 1, title: "VDing으로 만든 SNS 서비스",
    date: "2026.01.15", duration: "조회 1.2k",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&q=70",
    description: "VDing 플랫폼을 활용해 Instagram 스타일의 SNS 서비스를 30분 만에 구축한 프로젝트입니다.",
  },
  {
    id: "rec2", number: 2, title: "AI 기반 학습 플랫폼",
    date: "2026.01.14", duration: "조회 890",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&q=70",
    description: "Duolingo 스타일의 게이미피케이션 학습 서비스를 VDing으로 제작했습니다.",
  },
  {
    id: "rec3", number: 3, title: "커뮤니티 이벤트 모임 앱",
    date: "2026.01.13", duration: "조회 2.1k",
    thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&q=70",
    description: "Trevari 스타일의 이벤트 모임 커뮤니티 서비스를 코딩 없이 만들었습니다.",
  },
  {
    id: "rec4", number: 4, title: "간편 송금 FinTech 서비스",
    date: "2026.01.12", duration: "조회 1.5k",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=70",
    description: "Toss 스타일의 간편 송금 서비스를 VDing으로 빠르게 프로토타이핑했습니다.",
  },
];

// ── 뉴진(眞)스 탭 데이터 ──
const MOCK_NEWJEANS = [
  {
    id: "nj1",
    title: "[팩트체크] AI가 인간의 일자리를 대체한다는 주장, 사실일까?",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&q=70",
    category: "과학기술",
    views: "2.4M"
  },
  {
    id: "nj2",
    title: "[팩트체크] 기후변화 관련 오보, 실제 데이터로 검증",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=70",
    category: "환경",
    views: "1.8M"
  },
  {
    id: "nj3",
    title: "[팩트체크] 경제 정책 관련 주장, 전문가 검증 결과",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=70",
    category: "경제",
    views: "3.1M"
  },
  {
    id: "nj4",
    title: "[팩트체크] 건강 정보 유포, 의학 전문가가 밝힌 진실",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&q=70",
    category: "건강",
    views: "2.7M"
  },
  {
    id: "nj5",
    title: "[팩트체크] 사회 이슈 관련 가짜 뉴스, 실제 사실 확인",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=70",
    category: "사회",
    views: "1.5M"
  },
  {
    id: "nj6",
    title: "[팩트체크] 국제 정세 오보, 외교 전문가 검증",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=70",
    category: "국제",
    views: "1.9M"
  },
];

// ── 프로젝트 공유 탭 데이터 ──
const MOCK_PROJECTS = [
  {
    id: "p1",
    highlightLabel: "인기 프로젝트",
    highlightSub: "VDing으로 만든",
    title: "나만의 커뮤니티 앱 만들기 #VDing",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=70",
    author: "김개발",
    likes: "1.2k"
  },
  {
    id: "p2",
    highlightLabel: "신규 프로젝트",
    highlightSub: "30분 만에 완성한",
    title: "SNS 서비스 프로토타입 공유 #VDing",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=70",
    author: "박디자인",
    likes: "890"
  },
  {
    id: "p3",
    highlightLabel: "추천 프로젝트",
    highlightSub: "코딩 없이 만든",
    title: "EdTech 학습 플랫폼 만들기 #VDing",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=70",
    author: "이기획",
    likes: "2.1k"
  },
  {
    id: "p4",
    highlightLabel: "인기 프로젝트",
    highlightSub: "AI로 자동 생성된",
    title: "FinTech 송금 앱 UI 공유 #VDing",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&q=70",
    author: "최프론트",
    likes: "1.5k"
  },
];

// ── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function Feed3Page() {
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // 실제 서비스에서는 API Route에서 배너를 가져옴
  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => { if (data?.banners?.length) setBanners(data.banners); })
      .catch(() => { }); // fallback: MOCK_BANNERS 사용
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-20">

      {/* ── 광고 배너 슬라이더 ── */}
      <BannerSlider banners={banners} autoPlayInterval={5000} />

      {/* ── vding 서비스 소개 영역 ── */}
      <div className="px-4 pt-4 pb-2">
        {/* 플랫폼 뱃지 + 제목 */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-blue-500 font-bold text-xs tracking-widest">▶ NEW</span>
        </div>
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-1">VDing - AI 기반 서비스 빌더</h1>

        {/* 메타데이터 */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 text-xs mb-3">
          <span className="border border-gray-300 dark:border-zinc-500 px-1.5 py-0.5 rounded text-[10px] text-gray-700 dark:text-zinc-300">ALL</span>
          <span>2026.01.01</span>
          <span>·</span>
          <span>무료</span>
        </div>

        {/* vding 서비스 소개 */}
        <button
          className="w-full text-left"
          onClick={() => setIsInfoExpanded((p) => !p)}
        >
          <p className={`text-gray-700 dark:text-zinc-300 text-sm leading-relaxed ${isInfoExpanded ? "" : "line-clamp-2"}`}>
            VDing은 아이디어만 입력하면 즉시 프로젝트를 생성할 수 있는 AI 기반 서비스 빌더 플랫폼입니다.
            SNS, EdTech, Messaging, FinTech, Community, ESG 등 7가지 카테고리와 30개 이상의 UI 테마를 제공하며,
            Instagram, TikTok, Duolingo, KakaoTalk, Toss 등 인기 서비스 스타일을 즉시 적용할 수 있습니다.
            코딩 지식 없이도 나만의 서비스를 빠르게 구축하고, 프로젝트 대시보드에서 실시간으로 관리할 수 있습니다.
          </p>
          {!isInfoExpanded && (
            <span className="text-gray-500 dark:text-zinc-400 text-xs">더보기</span>
          )}
        </button>
      </div>

      {/* ── 하이미디어 코딩학원 부트캠프 광고 카드 ── */}
      <div className="mx-4 mt-4 mb-2 flex items-center gap-3 bg-gray-100 dark:bg-zinc-900 rounded-xl p-3">
        <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-800">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&q=70"
            alt="하이미디어 코딩학원"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white font-semibold text-sm mb-0.5">하이미디어 코딩학원 부트캠프</p>
          <p className="text-gray-600 dark:text-zinc-400 text-xs leading-relaxed">
            풀스택 개발자 양성 과정 · 6개월 집중 교육
          </p>
          <p className="text-gray-600 dark:text-zinc-400 text-xs">프론트엔드 · 백엔드 · 데이터베이스 · 프로젝트 실습</p>
          <p className="text-gray-600 dark:text-zinc-400 text-xs">취업 연계 · 포트폴리오 제작 · 멘토링 지원</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-500 flex-shrink-0" />
      </div>

      {/* ── 탭 섹션 ── */}
      <div className="mt-4">
        <TabSection>
          {(activeTab) => (
            <>
              {/* ── 추천 탭 ── */}
              {activeTab === "추천" && (
                <div>
                  {/* 정렬 */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button className="flex items-center gap-1 text-gray-700 dark:text-zinc-300 text-sm">
                      인기순
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10l5 5 5-5" />
                        <path d="M7 14l5-5 5 5" />
                      </svg>
                    </button>
                  </div>

                  {/* 추천 콘텐츠 목록 */}
                  {MOCK_RECOMMENDED.map((item) => (
                    <EpisodeCard key={item.id} episode={item} />
                  ))}
                </div>
              )}

              {/* ── 뉴진(眞)스 탭 ── */}
              {activeTab === "뉴진(眞)스" && (
                <div className="px-4 pt-4">
                  <p className="text-gray-900 dark:text-white font-semibold text-base mb-3">팩트체크 뉴스</p>
                  <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
                    {MOCK_NEWJEANS.map((item) => (
                      <div key={item.id} className="flex-shrink-0 w-28">
                        <div className="w-28 h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 mb-1.5 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-white text-[10px] font-medium">{item.category}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-zinc-300 text-xs line-clamp-2 mb-0.5">{item.title}</p>
                        <p className="text-gray-500 dark:text-zinc-500 text-[10px]">조회 {item.views}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 프로젝트 공유 탭 ── */}
              {activeTab === "프로젝트 공유" && (
                <div className="grid grid-cols-2 gap-3 px-4 pt-4">
                  {MOCK_PROJECTS.map((project) => (
                    <div key={project.id} className="rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-900 relative">
                      {/* 강조 라벨 */}
                      <div className="absolute top-0 left-0 right-0 p-2 z-10 bg-gradient-to-b from-black/70 to-transparent">
                        <p className="text-gray-200 dark:text-zinc-300 text-[10px] leading-tight">{project.highlightSub}</p>
                        <p className="text-white font-bold text-sm leading-tight mt-0.5">
                          <span className="bg-indigo-600 px-1 rounded-sm">{project.highlightLabel}</span>
                        </p>
                      </div>
                      {/* 썸네일 */}
                      <div className="aspect-[9/16] max-h-52 overflow-hidden">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* 제목 및 정보 */}
                      <div className="p-2">
                        <p className="text-gray-700 dark:text-zinc-300 text-xs leading-snug line-clamp-2 mb-1">
                          {project.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 dark:text-zinc-500 text-[10px]">{project.author}</p>
                          <p className="text-gray-500 dark:text-zinc-500 text-[10px]">❤️ {project.likes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabSection>
      </div>
    </div>
  );
}
