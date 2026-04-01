/**
 * Feed Centric Dashboard API Client
 * 백엔드 /api/v1/ui_editor/sns/feed_centric/* 엔드포인트 연동
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api/v1";

/* ─── 타입 ─── */

export interface FeedCentricDashboardData {
  app_name: string;
  nav_config?: {
    tabs: { id: string; label: string; icon: string }[];
  } | null;
  preview_data?: {
    app_name?: string;
    tagline?: string;
    stories?: { username: string; color: string }[];
    posts?: {
      username: string;
      avatar_color: string;
      content: string;
      image_color: string;
      likes: number;
      comments: number;
      time: string;
    }[];
  } | null;
  stats?: {
    total_screens: number;
    total_components: number;
    last_edited: string | null;
  } | null;
  settings?: {
    theme: string;
    language: string;
  } | null;
  recent_activities?: any[];
  screens?: {
    id: string;
    screen_name: string;
    screen_type: string;
    component_count: number;
  }[];
}

export interface FeedCentricScreenData {
  id: string;
  project_id: string;
  user_id: string;
  screen_name: string;
  screen_type: string;
  components: {
    id: string;
    type: string;
    props: Record<string, any>;
    position?: { x: number; y: number } | null;
  }[];
  nav_config?: Record<string, any> | null;
  preview_data?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

/* ─── 공통 fetch ─── */

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;

  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token") || "";
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${res.statusText} — ${body}`);
  }

  return res.json();
}

/* ─── Dashboard ─── */

export async function getDashboard(
  projectId: string
): Promise<FeedCentricDashboardData> {
  return apiFetch<FeedCentricDashboardData>(
    `/ui_editor/sns/feed_centric/dashboard/${projectId}`
  );
}

export async function updateDashboard(
  projectId: string,
  data: {
    app_name?: string;
    nav_config?: any;
    preview_data?: any;
    settings?: any;
    components?: any[];
    screens_data?: any[];
  }
): Promise<{ success: boolean; screen_id: string; created: boolean }> {
  return apiFetch(`/ui_editor/sns/feed_centric/dashboard/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* ─── Screen CRUD ─── */

export async function listScreens(
  projectId: string
): Promise<FeedCentricScreenData[]> {
  return apiFetch<FeedCentricScreenData[]>(
    `/ui_editor/sns/feed_centric/screens?project_id=${projectId}`
  );
}

export async function getScreen(
  screenId: string
): Promise<FeedCentricScreenData> {
  return apiFetch<FeedCentricScreenData>(
    `/ui_editor/sns/feed_centric/screens/${screenId}`
  );
}

export async function createScreen(
  projectId: string,
  screenName: string,
  screenType: string = "feed"
): Promise<FeedCentricScreenData> {
  return apiFetch<FeedCentricScreenData>(
    `/ui_editor/sns/feed_centric/screens`,
    {
      method: "POST",
      body: JSON.stringify({
        project_id: projectId,
        screen_name: screenName,
        screen_type: screenType,
      }),
    }
  );
}

export async function updateScreen(
  screenId: string,
  data: {
    screen_name?: string;
    screen_type?: string;
    components?: any[];
    nav_config?: any;
    preview_data?: any;
    settings?: any;
  }
): Promise<FeedCentricScreenData> {
  return apiFetch<FeedCentricScreenData>(
    `/ui_editor/sns/feed_centric/screens/${screenId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteScreen(
  screenId: string
): Promise<{ success: boolean }> {
  return apiFetch(`/ui_editor/sns/feed_centric/screens/${screenId}`, {
    method: "DELETE",
  });
}

/* ─── 컴포넌트 순서 변경 ─── */

export async function reorderComponents(
  screenId: string,
  componentIds: string[]
): Promise<FeedCentricScreenData> {
  return apiFetch<FeedCentricScreenData>(
    `/ui_editor/sns/feed_centric/screens/${screenId}/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({
        component_ids: componentIds,
      }),
    }
  );
}
