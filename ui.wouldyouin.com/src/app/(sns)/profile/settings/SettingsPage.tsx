"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShieldCheck,
  Globe2,
  Clock4,
  Bookmark,
  Archive,
  History,
  EyeOff,
  Star,
  Users,
  MessageCircle,
  AtSign,
  MessageCircleMore,
  Share2,
  Slash,
  Languages,
  BarChart3,
  MonitorSmartphone,
  Smartphone,
  HelpCircle,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  Activity,
  Lock,
  Mail,
  User,
  Settings,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

// ── 활동 기록 타입 ────────────────────────────────────────────
interface HistoryItem {
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN:       "로그인",
  LOGOUT:      "로그아웃",
  PAGE_VIEW:   "페이지 조회",
  LIKE:        "좋아요",
  SAVE:        "저장",
  COMMENT:     "댓글",
  POST_CREATE: "게시물 업로드",
};

const RESOURCE_LABELS: Record<string, string> = {
  feed: "피드",
  learning: "러닝",
  community_contests: "공모전",
  community_jobs: "채용",
  community_board: "게시판",
  community_study: "스터디",
  community_connect: "커넥트",
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<"settings" | "history">("settings");
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-200">
        <h2 className="text-base font-semibold">설정 및 활동</h2>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("settings")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "settings"
              ? "border-b-2 border-black text-black"
              : "text-gray-400"
          }`}
        >
          설정
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "history"
              ? "border-b-2 border-black text-black"
              : "text-gray-400"
          }`}
        >
          내 활동
        </button>
      </div>

      {tab === "settings" ? (
        <SettingsTab logout={logout} />
      ) : (
        <HistoryTab />
      )}
    </div>
  );
}

// ── 설정 탭 ───────────────────────────────────────────────────
function SettingsTab({ logout }: { logout: () => Promise<void> }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [language, setLanguage] = useState("ko");
  const [savingLanguage, setSavingLanguage] = useState(false);

  // 언어 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/profile/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.language) setLanguage(data.language);
          if (data.notifications !== undefined) setNotifications(data.notifications);
          if (data.is_public !== undefined) setIsPublic(data.is_public);
        }
      } catch {
        // 기본값 유지
      }
    };
    loadSettings();
  }, []);

  // 언어 변경 시 백엔드에 저장
  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    setSavingLanguage(true);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLanguage }),
      });
      if (!res.ok) {
        console.error("언어 설정 저장 실패");
        // 실패 시 이전 값으로 복구
        setLanguage("ko");
      }
    } catch (err) {
      console.error("언어 설정 저장 오류:", err);
      setLanguage("ko");
    } finally {
      setSavingLanguage(false);
    }
  };

  return (
    <div className="pb-10">
      {/* ── MUSTHAVE: 계정 센터 ── */}
      <Section title="계정 관리">
        <Row
          icon={<Lock className="w-4 h-4" />}
          label="비밀번호 변경"
          onClick={() => router.push("/profile/settings/password")}
        />
        <Row
          icon={<Mail className="w-4 h-4" />}
          label="이메일 변경"
          onClick={() => router.push("/profile/settings/email")}
        />
        <Row
          icon={<User className="w-4 h-4" />}
          label="프로필 편집"
          onClick={() => router.push("/profile/edit")}
        />
      </Section>

      {/* ── MUSTHAVE: 알림 설정 ── */}
      <Section title="알림">
        <ToggleRow
          icon={<Bell className="w-4 h-4" />}
          label="푸시 알림"
          description="새 게시물, 댓글, 좋아요 알림 받기"
          value={notifications}
          onChange={setNotifications}
        />
        <Row
          icon={<Bell className="w-4 h-4" />}
          label="알림 세부 설정"
          onClick={() => router.push("/profile/settings/notifications")}
        />
      </Section>

      {/* ── MUSTHAVE: 프라이버시 및 보안 ── */}
      <Section title="프라이버시 및 보안">
        <ToggleRow
          icon={<Globe2 className="w-4 h-4" />}
          label="계정 공개"
          description={isPublic ? "모든 사용자가 내 게시물을 볼 수 있습니다" : "팔로우한 사용자만 내 게시물을 볼 수 있습니다"}
          value={isPublic}
          onChange={setIsPublic}
        />
        <Row
          icon={<Users className="w-4 h-4" />}
          label="차단된 계정"
          onClick={() => router.push("/profile/settings/blocked")}
        />
        <Row
          icon={<Shield className="w-4 h-4" />}
          label="개인정보 보호"
          onClick={() => router.push("/profile/settings/privacy")}
        />
      </Section>

      {/* ── MUSTHAVE: 언어 설정 ── */}
      <Section title="언어 및 지역">
        <SelectRow
          icon={<Languages className="w-4 h-4" />}
          label="언어"
          value={language}
          onChange={handleLanguageChange}
          options={[
            { value: "ko", label: "한국어" },
            { value: "en", label: "English" },
            { value: "ja", label: "日本語" },
          ]}
          saving={savingLanguage}
        />
      </Section>

      {/* ── GOODTOHAVE: 내 VDing 사용 방식 ── */}
      <Section title="내 VDing 사용 방식">
        <Row icon={<Bookmark className="w-4 h-4" />} label="저장됨" />
        <Row icon={<Archive className="w-4 h-4" />} label="보관" />
        <Row icon={<History className="w-4 h-4" />} label="내 활동" />
        <Row icon={<Clock4 className="w-4 h-4" />} label="시간 관리" />
      </Section>

      {/* ── GOODTOHAVE: 앱 설정 ── */}
      <Section title="앱 설정">
        <Row icon={<Smartphone className="w-4 h-4" />} label="기기 권한" />
        <Row icon={<MonitorSmartphone className="w-4 h-4" />} label="접근성" />
        <Row
          icon={<BarChart3 className="w-4 h-4" />}
          label="데이터 사용량"
        />
      </Section>

      {/* ── GOODTOHAVE: 계정 정보 ── */}
      <Section title="계정 정보">
        <Row icon={<BarChart3 className="w-4 h-4" />} label="계정 유형" />
        <Row icon={<ShieldCheck className="w-4 h-4" />} label="프로필 인증" />
      </Section>

      {/* ── GOODTOHAVE: 결제 및 구독 ── */}
      <Section title="결제 및 구독">
        <Row icon={<CreditCard className="w-4 h-4" />} label="구독 관리" />
        <Row icon={<CreditCard className="w-4 h-4" />} label="결제 내역" />
      </Section>

      {/* ── GOODTOHAVE: 도움말 및 지원 ── */}
      <Section title="도움말 및 지원">
        <Row icon={<HelpCircle className="w-4 h-4" />} label="도움말" />
        <Row icon={<Shield className="w-4 h-4" />} label="개인정보 보호 센터" />
        <Row icon={<ShieldCheck className="w-4 h-4" />} label="계정 상태" />
        <Row icon={<Globe2 className="w-4 h-4" />} label="정보" />
      </Section>

      {/* 로그인 영역 */}
      <div className="px-4 py-5 border-t border-gray-100 space-y-2">
        <button className="w-full text-left text-sm text-blue-500">
          계정 추가
        </button>
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-500 flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}

// ── 내 활동 탭 ────────────────────────────────────────────────
function HistoryTab() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/history?page=1");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-400 text-sm">
        불러오는 중...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400 gap-2">
        <Activity className="w-8 h-8" />
        <p className="text-sm">아직 활동 기록이 없습니다.</p>
      </div>
    );
  }

  // 환경에 맞는 백엔드 URL 결정
  const BACKEND = typeof window !== "undefined"
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://api.wouldyouin.com")
    : process.env.API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => {
        const isPost = item.action === "POST_CREATE";
        const meta = item.metadata as any;
        const imageUrls: string[] = isPost ? (meta?.image_urls ?? []) : [];
        const firstImg = imageUrls[0]
          ? imageUrls[0].startsWith("https://")
            ? imageUrls[0]
            : imageUrls[0].startsWith("/data/")
              ? `${BACKEND}${imageUrls[0]}`
              : imageUrls[0]
          : null;

        return (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            {/* 게시물 업로드는 썸네일, 나머지는 아이콘 */}
            {isPost && firstImg ? (
              <img
                src={firstImg}
                alt="post"
                className="w-10 h-10 rounded-md object-cover shrink-0 border border-gray-200"
              />
            ) : (
              <Activity className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                {ACTION_LABELS[item.action] ?? item.action}
                {item.resource_type && !isPost && (
                  <span className="text-gray-500">
                    {" — "}
                    {RESOURCE_LABELS[item.resource_type] ?? item.resource_type}
                  </span>
                )}
                {isPost && (
                  <span className="text-gray-500">
                    {" — "}{meta?.file_count ?? imageUrls.length}장
                    {meta?.location ? ` · ${meta.location}` : ""}
                  </span>
                )}
              </p>
              {isPost && meta?.caption && (
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{meta.caption}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5">
                {new Date(item.created_at).toLocaleString("ko-KR")}
              </p>
            </div>

            {/* 다중 이미지 나머지 썸네일 */}
            {isPost && imageUrls.length > 1 && (
              <div className="flex gap-1 shrink-0">
                {imageUrls.slice(1, 4).map((url, idx) => {
                  const src = url.startsWith("https://")
                    ? url
                    : url.startsWith("/data/")
                      ? `${BACKEND}${url}`
                      : url;
                  return (
                    <img
                      key={idx}
                      src={src}
                      alt="thumb"
                      className="w-8 h-8 rounded object-cover border border-gray-200"
                    />
                  );
                })}
                {imageUrls.length > 4 && (
                  <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                    +{imageUrls.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 공통 컴포넌트 ─────────────────────────────────────────────
type RowProps = { 
  icon: React.ReactNode; 
  label: string; 
  description?: string;
  onClick?: () => void;
};

function Row({ icon, label, description, onClick }: RowProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-700">{icon}</div>
        <div className="text-left">
          <p className="text-sm">{label}</p>
          {description && (
            <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}

type ToggleRowProps = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-gray-700">{icon}</div>
        <div className="text-left flex-1">
          <p className="text-sm">{label}</p>
          {description && (
            <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

type SelectRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  saving?: boolean;
};

function SelectRow({ icon, label, value, onChange, options, saving }: SelectRowProps) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-gray-700">{icon}</div>
        <div className="text-left flex-1">
          <p className="text-sm">{label}</p>
          {saving && (
            <p className="text-[11px] text-gray-500 mt-0.5">저장 중...</p>
          )}
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={saving}
        className="text-sm text-gray-700 bg-transparent border-0 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type SectionProps = { title: string; children: React.ReactNode };

function Section({ title, children }: SectionProps) {
  return (
    <section className="border-b border-gray-100">
      <div className="px-4 pt-4 pb-1">
        <p className="text-xs font-semibold text-gray-500">{title}</p>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}
