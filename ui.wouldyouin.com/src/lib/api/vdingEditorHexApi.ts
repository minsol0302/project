/**
 * VDing Editor 헥사고날 아키텍처 API Client
 * 백엔드: /api/v1/vding-editor-app/
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.wouldyouin.com/api/v1";
const HEX_BASE = `${API_BASE}/vding-editor-app`;

async function hexFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// ══════════════════════════════════════════════════════════════════
// Editor Projects  (editor_projects 테이블)
// ══════════════════════════════════════════════════════════════════

export interface EditorProjectSummary {
  id: string;
  title: string;
  template_id: string;
  created_at: string;
  updated_at: string;
  is_saved: boolean;
}

/**
 * template_id → 카테고리 한글 이름 매핑
 */
export function templateToCategory(templateId: string): string {
  const map: Record<string, string> = {
    "beauty-salon": "뷰티",
    "cafe-order": "F&B",
    "online-course": "교육",
    "real-estate": "부동산",
    fitness: "기타",
    "music-streaming": "기타",
    sns: "SNS",
    ecommerce: "쇼핑",
    health: "헬스",
    finance: "금융",
  };
  return map[templateId] ?? "기타";
}

/**
 * 사용자 프로젝트 목록 조회 (최신순 정렬)
 * GET /api/v1/vding-editor-app/editor/projects?user_id={userId}
 */
export async function listEditorProjects(
  userId: string = "default"
): Promise<EditorProjectSummary[]> {
  const data = await hexFetch<EditorProjectSummary[]>(
    `${HEX_BASE}/editor/projects?user_id=${encodeURIComponent(userId)}`
  );
  // updated_at 내림차순 정렬
  return [...data].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

/**
 * 프로젝트 단건 조회
 * GET /api/v1/vding-editor-app/editor/projects/{id}?user_id={userId}
 */
export async function getEditorProject(
  id: string,
  userId: string = "default"
): Promise<EditorProjectSummary | null> {
  try {
    return await hexFetch<EditorProjectSummary>(
      `${HEX_BASE}/editor/projects/${encodeURIComponent(id)}?user_id=${encodeURIComponent(userId)}`
    );
  } catch {
    return null;
  }
}

/**
 * 프로젝트 생성
 * POST /api/v1/vding-editor-app/editor/projects?user_id={userId}
 */
export async function createEditorProject(
  payload: { template_id: string; title: string },
  userId: string = "default"
): Promise<EditorProjectSummary> {
  return hexFetch<EditorProjectSummary>(
    `${HEX_BASE}/editor/projects?user_id=${encodeURIComponent(userId)}`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

/**
 * 프로젝트 삭제
 * DELETE /api/v1/vding-editor-app/editor/projects/{id}?user_id={userId}
 */
export async function deleteEditorProject(
  id: string,
  userId: string = "default"
): Promise<boolean> {
  try {
    await hexFetch(
      `${HEX_BASE}/editor/projects/${encodeURIComponent(id)}?user_id=${encodeURIComponent(userId)}`,
      { method: "DELETE" }
    );
    return true;
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════
// Main Page  (main_pages 테이블)
// ══════════════════════════════════════════════════════════════════

export interface MainPageProjectCard {
  id: string;
  name: string;
  category: string;
  last_modified: string;
  screens: number;
  components: number;
}

export interface MainPageKpiCard {
  label: string;
  value: number;
  unit: string;
  sub: string;
}

export interface MainPageData {
  kpi_cards: MainPageKpiCard[];
  projects: MainPageProjectCard[];
  activities: { time: string; action: string; icon: string }[];
  roadmap_items: { name: string; progress: number }[];
  documents: { name: string; doc_type: string; project: string; date: string }[];
  payments: { date: string; item: string; amount: string; status: string }[];
  theme: string;
  active_tab: string;
}

/**
 * 메인 페이지 전체 데이터 (프로젝트 카드 포함)
 * GET /api/v1/vding-editor-app/main?user_id={userId}
 */
export async function getMainPageData(
  userId: string = "default"
): Promise<MainPageData | null> {
  try {
    return await hexFetch<MainPageData>(
      `${HEX_BASE}/main?user_id=${encodeURIComponent(userId)}`
    );
  } catch {
    return null;
  }
}
