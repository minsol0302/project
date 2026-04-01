const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://api.wouldyouin.com:8080/api/v1";

interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── Feed ──
export const feedApi = {
  getList: () => request("/feed"),
  getDetail: (id: number) => request(`/feed/${id}`),
};

// ── Learning ──
export const learningApi = {
  getList: () => request("/learning"),
};

// ── Community ──
export const communityApi = {
  getMain: () => request("/community"),
  getContests: () => request("/community/contests"),
  getJobs: () => request("/community/jobs"),
  getBoard: () => request("/community/board"),
  getStudy: () => request("/community/study"),
  getConnect: () => request("/community/connect"),
};

// ── Explore ──
export const exploreApi = {
  getList: () => request("/explore"),
  search: (q: string) => request(`/explore/search?q=${encodeURIComponent(q)}`),
};

// ── Profile ──
export const profileApi = {
  get: () => request("/profile"),
  update: (data: unknown) =>
    request("/profile", { method: "PUT", body: JSON.stringify(data) }),
  getSettings: () => request("/profile/settings"),
  updateSettings: (data: unknown) =>
    request("/profile/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Health ──
export const healthApi = {
  check: () =>
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://api.wouldyouin.com:8080/api/v1"}/health`
    ).then((r) => r.json()),
};
