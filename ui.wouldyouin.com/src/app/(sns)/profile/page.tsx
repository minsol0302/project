/**
 * Profile Page — Server Component
 *
 * Performance benefits:
 * - User avatar in initial HTML → LCP improvement (priority image works)
 * - No loading spinner → content renders instantly
 * - Server-to-server fetch is faster than browser→server→server
 * - Less client JS → lower TBT
 *
 * Data flow:
 *   1. Server reads httpOnly cookie
 *   2. Parallel fetch: user + posts + projects (server-to-server)
 *   3. HTML rendered with data → sent to browser
 *   4. ProfileContent hydrates → React Query takes over for infinite scroll
 */
import { redirect } from "next/navigation";
import { getServerUser, getAuthToken } from "../../lib/getServerUser";
import ProfileContent from "./ProfileContent";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const INITIAL_SIZE = 4;

interface PostsPage {
  posts: Array<{
    id: string;
    image_urls: string[];
    caption: string | null;
    filter: string;
    created_at: string;
  }>;
  count: number;
  has_more: boolean;
  page: number;
}

interface VdingProject {
  project_id: string;
  project_title: string;
  category: string;
  ui_style: string;
  step: string;
  updated_at: string;
  thumbnail_color: string;
}

/** Fetch initial posts (server-side, direct to backend) */
async function fetchInitialPosts(token: string): Promise<PostsPage> {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/profile/posts?page=1&size=${INITIAL_SIZE}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      }
    );
    if (!res.ok) return { posts: [], count: 0, has_more: false, page: 1 };
    return await res.json();
  } catch {
    return { posts: [], count: 0, has_more: false, page: 1 };
  }
}

/** Fetch VDing projects (server-side, direct to backend) */
async function fetchProjects(token: string): Promise<VdingProject[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/vding/projects/list`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects ?? [];
  } catch {
    return [];
  }
}

export default async function ProfilePage() {
  // Parallel fetch: user + token (for data fetching)
  const [user, token] = await Promise.all([
    getServerUser(),
    getAuthToken(),
  ]);

  if (!user || !token) {
    redirect("/login");
  }

  // Parallel fetch: posts + projects (server-to-server, very fast)
  const [initialPosts, initialProjects] = await Promise.all([
    fetchInitialPosts(token),
    fetchProjects(token),
  ]);

  return (
    <ProfileContent
      user={user}
      initialPosts={initialPosts}
      initialProjects={initialProjects}
    />
  );
}
