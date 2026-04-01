/**
 * VDing Editor API Client
 * 기존 프로젝트의 API 호출 패턴에 맞춤
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.wouldyouin.com/api/v1";
const EDITOR_BASE = `${API_BASE}/vding-editor`;

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include", // vding_auth 쿠키 자동 전송
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// ═══ 에디터 프로젝트 CRUD ═══

export interface EditorProject {
  id: string;
  user_id: string;
  project_name: string;
  theme: string;
  description: string;
  status: string;
  progress: number;
  created_at: string;
  screens?: EditorScreen[];
}

export interface EditorScreen {
  id: string;
  project_id: string;
  screen_name: string;
  components: Record<string, unknown>[];
  order_index: number;
}

export function createProject(data: { name: string; theme: string; description?: string }) {
  return apiFetch<EditorProject>(`${EDITOR_BASE}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listProjects(theme?: string) {
  const q = theme ? `?theme=${theme}` : "";
  return apiFetch<EditorProject[]>(`${EDITOR_BASE}/projects${q}`);
}

export function getProject(id: string) {
  return apiFetch<EditorProject>(`${EDITOR_BASE}/projects/${id}`);
}

export function updateScreen(projectId: string, screenId: string, data: Partial<EditorScreen>) {
  return apiFetch<EditorScreen>(`${EDITOR_BASE}/projects/${projectId}/screens/${screenId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string) {
  return apiFetch<{ success: boolean }>(`${EDITOR_BASE}/projects/${id}`, { method: "DELETE" });
}

// ═══ 대시보드 API ═══

export function getRequirements(projectId: string) {
  return apiFetch<unknown[]>(`${EDITOR_BASE}/dashboard/${projectId}/requirements`);
}

export function createRequirement(projectId: string, data: unknown) {
  return apiFetch<unknown>(`${EDITOR_BASE}/dashboard/${projectId}/requirements`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getChecklist(projectId: string) {
  return apiFetch<unknown[]>(`${EDITOR_BASE}/dashboard/${projectId}/checklist`);
}

export function toggleChecklist(itemId: string, done: boolean) {
  return apiFetch<unknown>(`${EDITOR_BASE}/dashboard/checklist/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ done }),
  });
}

export function getBusinessInfo() {
  return apiFetch<unknown>(`${EDITOR_BASE}/dashboard/business-info`);
}

export function saveBusinessInfo(data: unknown) {
  return apiFetch<unknown>(`${EDITOR_BASE}/dashboard/business-info`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getLegalDocs(projectId: string) {
  return apiFetch<unknown[]>(`${EDITOR_BASE}/dashboard/${projectId}/legal`);
}

export function getBudget(projectId: string) {
  return apiFetch<unknown>(`${EDITOR_BASE}/dashboard/${projectId}/budget`);
}

export function getVersions(projectId: string) {
  return apiFetch<unknown[]>(`${EDITOR_BASE}/dashboard/${projectId}/versions`);
}

export function getStoreSubmissions(projectId: string) {
  return apiFetch<unknown[]>(`${EDITOR_BASE}/dashboard/${projectId}/store-submissions`);
}

// ═══ Dashboard2 API ═══

export interface Dashboard2Data {
  project_id: string;
  kpis: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  activities: Record<string, unknown>[];
  requirements: Record<string, unknown>[];
  data_tables: Record<string, unknown>[];
  wireframe_screens: Record<string, unknown>[];
  gantt_tasks: Record<string, unknown>[];
  versions: Record<string, unknown>[];
  store_issues: Record<string, unknown>[];
  legal_docs: Record<string, unknown>[];
  service_sections: Record<string, unknown>[];
  business_info: Record<string, unknown>;
  budget_categories: Record<string, unknown>[];
  risks: Record<string, unknown>[];
  checklist_items: Record<string, unknown>[];
  cicd_pipelines: Record<string, unknown>[];
  monitor_metrics: Record<string, unknown>[];
}

export function getDashboard2(projectId: string) {
  return apiFetch<Dashboard2Data>(`${EDITOR_BASE}/dashboard2/${projectId}`);
}