/**
 * Auth Store (Zustand)
 * - Hydration-safe: server and client both start with null (no #418 error)
 * - localStorage cache: restored in fetchMe() first tick (sync, ~0ms)
 * - Background refresh: API call updates data after cache restore
 */
import { create } from "zustand";

const AUTH_CACHE_KEY = "vding_auth_user";

export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

function getCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setCachedUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  // IMPORTANT: Always start null/true for hydration consistency (server === client)
  user: null,
  isLoading: true,

  setUser: (user) => {
    setCachedUser(user);
    set({ user });
  },

  fetchMe: async () => {
    // Step 1: Instant restore from localStorage (sync, 0ms delay)
    const cached = getCachedUser();
    if (cached) {
      set({ user: cached, isLoading: false });
    }

    // Step 2: Background refresh from API
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const freshUser = await res.json();
        setCachedUser(freshUser);
        set({ user: freshUser });
      } else {
        setCachedUser(null);
        set({ user: null });
      }
    } catch {
      // API failed but cache exists — keep cache
      if (!cached) {
        setCachedUser(null);
        set({ user: null });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCachedUser(null);
    set({ user: null });
    window.location.href = "/login";
  },
}));
