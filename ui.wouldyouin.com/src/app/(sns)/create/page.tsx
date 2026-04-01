'use client';

/**
 * /create — 게시물 · 스토리 생성 페이지
 *
 * ※ 이미지 저장 방식:
 *   - 이미지 파일 자체: AWS S3 (오브젝트 스토리지) → /api/create 엔드포인트 사용
 *   - 메타데이터(URL, 캡션, 위치 등): Neon DB (vding_posts2 테이블)
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, ImagePlus,
  MapPin, Tag, CheckCircle2, X, Sparkles,
  Undo2, Redo2, Loader2,
} from "lucide-react";

// ── 타입 ───────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

// ── CSS 필터 프리셋 ────────────────────────────────────────────────────────
const FILTERS = [
  { id: "normal",  label: "기본",   css: "none" },
  { id: "bright",  label: "밝게",   css: "brightness(1.35)" },
  { id: "warm",    label: "따뜻",   css: "sepia(0.35) saturate(1.5) brightness(1.08)" },
  { id: "cool",    label: "차갑게", css: "saturate(0.75) hue-rotate(28deg) brightness(1.06)" },
  { id: "fade",    label: "페이드", css: "opacity(0.88) saturate(0.65) brightness(1.18)" },
  { id: "vivid",   label: "선명",   css: "saturate(1.7) contrast(1.12)" },
  { id: "mono",    label: "흑백",   css: "grayscale(1)" },
  { id: "vintage", label: "빈티지", css: "sepia(0.55) contrast(0.9) brightness(1.05)" },
];

// ── File → Object URL 훅 ──────────────────────────────────────────────────
function useObjectURLs(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  return urls;
}

// ═══════════════════════════════════════════════════════════════════════════
export default function CreatePage() {
  const router = useRouter();

  const [files,     setFiles]     = useState<File[]>([]);
  const [curIdx,    setCurIdx]    = useState(0);
  const [filter,    setFilter]    = useState("normal");
  const [step,      setStep]      = useState<Step>(1);
  const [caption,   setCaption]    = useState("");
  const [location,  setLocation]  = useState("");
  const [hashtags,  setHashtags]  = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState<string>(""); // 해시태그 입력 필드
  const [uploading,  setUploading]  = useState(false);
  const [done,       setDone]       = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [savedUrls,  setSavedUrls]  = useState<string[]>([]);

  // ── V(뷔) AI 모드 — 캡션 히스토리 (undo/redo) ─────────────────────────
  // history[histIdx] 가 현재 표시 중인 캡션
  const [captionHistory, setCaptionHistory] = useState<string[]>([""]);
  const [histIdx,        setHistIdx]        = useState(0);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiError,        setAiError]        = useState<string | null>(null);
  const [hashtagAiLoading, setHashtagAiLoading] = useState(false);
  const [hashtagAiError, setHashtagAiError] = useState<string | null>(null);

  // caption 이 변경될 때 히스토리에 push (AI 버튼 외 직접 타이핑도 추적)
  // 단, AI 가 밀어넣은 변경은 별도로 처리하므로 여기선 "현재 인덱스 교체"만
  const syncHistory = useCallback(
    (text: string) => {
      setCaptionHistory((prev) => {
        const next = [...prev.slice(0, histIdx + 1), text];
        return next;
      });
      setHistIdx((i) => i + 1);
    },
    [histIdx]
  );

  const canUndo = histIdx > 0;
  const canRedo = histIdx < captionHistory.length - 1;

  const undo = () => {
    if (!canUndo) return;
    const prev = captionHistory[histIdx - 1];
    setHistIdx((i) => i - 1);
    setCaption(prev);
  };

  const redo = () => {
    if (!canRedo) return;
    const next = captionHistory[histIdx + 1];
    setHistIdx((i) => i + 1);
    setCaption(next);
  };

  // V AI 버튼 핸들러 - 이미지 기반 자동 생성
  const runVAI = async () => {
    if (files.length === 0) {
      setAiError("먼저 이미지를 선택해주세요.");
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      // 이미지가 있으면 이미지 기반으로 캡션 생성, 없으면 기존 캡션 개선
      const currentCaption = caption.trim() || "이미지를 설명해주세요";
      
      const res = await fetch("/api/ai/caption", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: currentCaption,
          imageContext: files[0]?.name ?? undefined,
        }),
      });
      
      const data = await res.json() as { enhanced?: string; error?: string };
      if (!res.ok || data.error) {
        setAiError(data.error ?? "AI 오류가 발생했습니다.");
        return;
      }
      
      if (data.enhanced) {
        // 현재 캡션을 히스토리에 먼저 저장 후 AI 결과 적용
        const current = caption || "";
        setCaptionHistory((prev) => [...prev.slice(0, histIdx + 1), current, data.enhanced!]);
        setHistIdx((i) => i + (current ? 2 : 1));  // 원본이 있으면 2개, 없으면 1개 push
        setCaption(data.enhanced);
        
        // 해시태그 자동 추출 및 추가
        const extractedHashtags = (data.enhanced.match(/#\S+/g) ?? []).map(tag => tag.slice(1));
        if (extractedHashtags.length > 0) {
          setHashtags(extractedHashtags);
        }
      }
    } catch {
      setAiError("네트워크 오류. 다시 시도해주세요.");
    } finally {
      setAiLoading(false);
    }
  };

  const fileInput = useRef<HTMLInputElement>(null);
  const previews  = useObjectURLs(files);
  const curFilter = FILTERS.find((f) => f.id === filter)?.css ?? "none";
  const maxFiles  = 10;

  // ── 파일 추가 공통 함수 ─────────────────────────────────────────────────
  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setFiles((prev) => {
      const merged = [...prev, ...valid].slice(0, maxFiles);
      return merged;
    });
    setCurIdx(0);
    setFilter("normal");
  }, [maxFiles]);

  // ── input change ────────────────────────────────────────────────────────
  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? []);
      addFiles(picked);
      // input 초기화 (같은 파일 재선택 허용)
      e.target.value = "";
    },
    [addFiles]
  );

  // ── 드래그앤드롭 핸들러 ─────────────────────────────────────────────────
  // 핵심: preventDefault + stopPropagation 으로 브라우저가 파일을 새 탭에
  // 여는 기본 동작을 완전히 차단
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();   // ← 브라우저 새 탭 열기 방지
      e.stopPropagation();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      addFiles(dropped);
    },
    [addFiles]
  );

  // 페이지 전체 drag → 브라우저 파일 열기 방지 (배경 영역 낙하 시)
  useEffect(() => {
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop",     prevent);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop",     prevent);
    };
  }, []);

  // ── 파일 삭제 ──────────────────────────────────────────────────────────
  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setCurIdx(0);
  };

  // ── 해시태그 입력 필드에서 해시태그 배열로 변환 ────────────────────────────
  useEffect(() => {
    // 해시태그 입력 필드에서 해시태그 추출 (#으로 시작하는 단어들)
    const extracted = (hashtagInput.match(/#\S+/g) ?? []).map(tag => tag.slice(1));
    setHashtags(extracted);
  }, [hashtagInput]);

  // ── 해시태그용 V AI 버튼 핸들러 ──────────────────────────────────────────
  const runHashtagVAI = async () => {
    if (!caption.trim() && !hashtagInput.trim()) {
      setHashtagAiError("캡션이나 해시태그를 먼저 입력해주세요.");
      return;
    }
    
    setHashtagAiLoading(true);
    setHashtagAiError(null);
    
    try {
      const res = await fetch("/api/ai/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption || hashtagInput,
        }),
      });
      
      const data = await res.json() as { hashtags?: string[]; error?: string };
      if (!res.ok || data.error) {
        setHashtagAiError(data.error ?? "AI 해시태그 생성에 실패했습니다.");
        return;
      }
      
      if (data.hashtags && data.hashtags.length > 0) {
        // 해시태그를 입력 필드에 추가 (기존 해시태그와 합치기)
        const existingTags = (hashtagInput.match(/#\S+/g) ?? []).map(t => t.slice(1));
        const newTags = data.hashtags.map(t => t.startsWith("#") ? t.slice(1) : t);
        const combined = [...new Set([...existingTags, ...newTags])]; // 중복 제거
        setHashtagInput(combined.map(t => `#${t}`).join(" "));
      }
    } catch {
      setHashtagAiError("네트워크 오류. 다시 시도해주세요.");
    } finally {
      setHashtagAiLoading(false);
    }
  };

  // ── 발행 ───────────────────────────────────────────────────────────────
  const publish = useCallback(async () => {
    setUploading(true);
    try {
      const form = new FormData();
      // 이미지 파일 추가 (S3 업로드용) - 이미지가 있을 때만
      if (files.length > 0) {
        files.forEach((f) => form.append("images", f));
      }
      
      // 게시물 정보 추가
      form.append("caption", caption);
      if (location) form.append("location", location);
      if (hashtags.length > 0) form.append("hashtags", JSON.stringify(hashtags));
      form.append("is_public", "true");
      
      // Next.js API 프록시 사용 (쿠키 자동 포함, S3 업로드 연동)
      const res = await fetch("/api/create", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setSavedUrls(data.image_urls || []);
        setDone(true);
        // 성공 시 피드로 이동
        setTimeout(() => {
          router.push("/feed");
        }, 1000);
      } else {
        setAiError(data.error || "게시물 업로드에 실패했습니다.");
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }, [files, caption, location, hashtags, router]);


  // ── 뒤로가기 ───────────────────────────────────────────────────────────
  const goBack = () => {
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); return; }
    router.back();
  };

  // ── 다음 / 공유 라벨 ───────────────────────────────────────────────────
  const nextLabel = () => {
    if (step === 3) return uploading ? "업로드 중..." : "공유";
    return "다음"; // 이미지 없이도 다음 버튼 활성화
  };
  const onNext = () => {
    if (step === 3) { 
      if (files.length === 0) {
        // 이미지 없이도 텍스트만으로 게시물 생성 가능
        publish();
        return;
      }
      publish(); 
      return; 
    }
    setStep((s) => (s + 1) as Step);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 공통 헤더
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const Header = () => {
    const label = nextLabel();
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button onClick={goBack}>
          {step > 1 ? <ChevronLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
        <span className="font-semibold text-base">
          {step === 1 ? "새 게시물" : step === 2 ? "필터" : "새 게시물"}
        </span>
        {label ? (
          <button
            className="text-blue-500 font-semibold text-sm disabled:opacity-40"
            onClick={onNext}
            disabled={uploading}
          >
            {label}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    );
  };


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1 — 미디어 선택 (드래그앤드롭 + 클릭)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white pb-16">
        <Header />

        {/* 드롭 존 */}
        <div
          className={`mx-4 mt-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-3 py-10
            ${isDragging
              ? "border-blue-400 bg-blue-50 scale-[1.01]"
              : "border-gray-200 bg-gray-50 hover:border-gray-400"
            }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus className={`w-12 h-12 ${isDragging ? "text-blue-400" : "text-gray-300"}`} />
          {isDragging ? (
            <p className="text-blue-500 font-semibold text-sm">여기에 놓으세요!</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">
                사진·동영상을 드래그하거나 탭해서 선택 (최대 {maxFiles}장)
              </p>
              <p className="text-xs text-gray-300">JPG · PNG · MP4 지원</p>
            </>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onFileChange}
        />

        {/* 선택된 파일 썸네일 목록 */}
        {files.length > 0 && (
          <div className="mx-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                선택된 파일 ({files.length}/{maxFiles})
              </p>
              {files.length < maxFiles && (
                <button
                  className="text-xs text-blue-500 font-medium"
                  onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}
                >
                  + 더 추가
                </button>
              )}
            </div>

            {/* 썸네일 그리드 — 드롭 순서대로 번호 표시 */}
            <div className="grid grid-cols-4 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={url} alt={`파일 ${i + 1}`} className="w-full h-full object-cover" />
                  {/* 순서 번호 */}
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{i + 1}</span>
                  </div>
                  {/* 삭제 버튼 */}
                  <button
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {/* 카드뉴스 안내 */}
            {files.length > 1 && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                번호 순서대로 카드뉴스 슬라이드가 구성됩니다
              </p>
            )}
          </div>
        )}

        {/* 파일 미선택 시 안내 */}
        {files.length === 0 && (
          <div className="mx-4 mt-4 bg-amber-50 rounded-xl p-4 text-xs text-amber-700 space-y-1.5">
            <p className="font-semibold text-sm">📌 이미지 저장 방식 안내</p>
            <p>• 이미지 파일 → AWS S3 (오브젝트 스토리지)</p>
            <p>• 캡션·위치·해시태그 → Neon DB (PostgreSQL)</p>
            <p className="text-amber-600">※ Neon DB는 텍스트 데이터만 저장합니다. 이미지 바이너리는 반드시 별도 스토리지를 사용해야 합니다.</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {aiError && (
          <div className="mx-4 mt-4 bg-red-50 rounded-xl p-4">
            <p className="text-xs text-red-600">{aiError}</p>
          </div>
        )}
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2 — 필터
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (step === 2) {
    return (
      <div className="min-h-screen bg-black pb-16">
        <Header />

        {/* 메인 미리보기 */}
        <div className="relative w-full aspect-square overflow-hidden">
          {previews.length > 1 && (
            <>
              {curIdx > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-1 z-10"
                  onClick={() => setCurIdx((i) => i - 1)}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              {curIdx < previews.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-1 z-10"
                  onClick={() => setCurIdx((i) => i + 1)}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {previews.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === curIdx ? "bg-white w-4" : "bg-white/50 w-1.5"}`} />
                ))}
              </div>
            </>
          )}
          <img src={previews[curIdx]} alt="preview" className="w-full h-full object-cover" style={{ filter: curFilter }} />
        </div>

        {/* 필터 스트립 */}
        <div className="bg-white border-t border-gray-100">
          <div className="flex overflow-x-auto scrollbar-hide gap-3 px-4 py-3">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${filter === f.id ? "border-black" : "border-transparent"}`}>
                  <img src={previews[0]} alt={f.label} className="w-full h-full object-cover" style={{ filter: f.css }} />
                </div>
                <span className={`text-xs font-medium ${filter === f.id ? "text-black" : "text-gray-400"}`}>{f.label}</span>
              </button>
            ))}
          </div>
          {files.length > 1 && (
            <p className="text-center text-xs text-gray-400 pb-3">선택한 필터는 {files.length}장 전체에 적용됩니다</p>
          )}
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3 — 정보 입력
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (step === 3) {
    return (
      <div className="min-h-screen bg-white pb-16">
        <Header />

        {/* 썸네일 + 캡션 텍스트 */}
        <div className="flex gap-3 px-4 py-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
            <img src={previews[0]} alt="thumb" className="w-full h-full object-cover" style={{ filter: curFilter }} />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              className="w-full text-sm resize-none outline-none placeholder-gray-400 leading-relaxed"
              rows={4}
              placeholder="문구를 입력하세요..."
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              maxLength={2200}
            />
            {/* 캡션용 V 버튼과 히스토리 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={runVAI}
                disabled={aiLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all
                  ${aiLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
                  }`}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>V가 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>V 버튼 - 캡션 개선</span>
                  </>
                )}
              </button>
              {/* Undo/Redo 버튼 */}
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                title="이전 내용으로 되돌리기"
              >
                <Undo2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                title="앞으로 가기"
              >
                <Redo2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {aiError && (
              <p className="text-xs text-red-500">{aiError}</p>
            )}
          </div>
        </div>

        {/* 해시태그 입력 공간 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">해시태그</span>
            {hashtags.length > 0 && (
              <span className="text-xs text-blue-500">({hashtags.length}개)</span>
            )}
          </div>
          <input
            type="text"
            className="w-full text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2"
            placeholder="#해시태그를 입력하세요 (예: #여행 #일상)"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
          />
          {/* 해시태그용 V 버튼 */}
          <button
            onClick={runHashtagVAI}
            disabled={hashtagAiLoading || (!caption.trim() && !hashtagInput.trim())}
            className={`w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all
              ${hashtagAiLoading || (!caption.trim() && !hashtagInput.trim())
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
              }`}
          >
            {hashtagAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>V가 해시태그 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>V 버튼 - 해시태그 생성</span>
              </>
            )}
          </button>
          {hashtagAiError && (
            <p className="mt-2 text-xs text-red-500">{hashtagAiError}</p>
          )}
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hashtags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {files.length > 1 && (
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="flex gap-1">
              {previews.slice(0, 6).map((url, i) => (
                <div key={i} className="relative w-8 h-8 rounded overflow-hidden">
                  <img src={url} className="w-full h-full object-cover" alt="" style={{ filter: curFilter }} />
                  <span className="absolute bottom-0 right-0 text-[8px] text-white bg-black/50 px-0.5">{i + 1}</span>
                </div>
              ))}
              {files.length > 6 && (
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{files.length - 6}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500">카드 {files.length}장</span>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <MapPin className="w-5 h-5 text-gray-400" />
          <input className="flex-1 text-sm outline-none placeholder-gray-400" placeholder="위치 추가" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <Tag className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">사람 태그하기</span>
          <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
        </div>

        <div className="px-4 py-2 text-right">
          <span className="text-xs text-gray-300">{caption.length} / 2,200</span>
        </div>
      </div>
    );
  }

  // 기본적으로 step 1로 리다이렉트 (스토리 탭 제거로 인해)
  return null;
}
