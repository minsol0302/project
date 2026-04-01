"use client";

/**
 * AuthSync - Thin client wrapper
 * Syncs server-fetched user data to Zustand auth store
 * so other client components (pages) can access user via useAuthStore
 */
import { useEffect, useRef } from "react";
import { useAuthStore, type AuthUser } from "../store/useAuthStore";

interface AuthSyncProps {
  user: AuthUser;
  children: React.ReactNode;
}

export function AuthSync({ user, children }: AuthSyncProps) {
  const syncRef = useRef(false);

  // Sync server user to client store on mount
  useEffect(() => {
    if (!syncRef.current) {
      useAuthStore.setState({ user, isLoading: false });
      syncRef.current = true;
    }
  }, [user]);

  return <>{children}</>;
}
