/**
 * (sns) Layout — Server Component
 *
 * - Auth check is done server-side (no loading spinner)
 * - User data is fetched on the server and passed to client components
 * - Middleware handles redirect for unauthenticated users
 * - AuthSync syncs user to Zustand store for other client pages
 */
import { redirect } from "next/navigation";
import { getServerUser } from "../lib/getServerUser";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { AuthSync } from "./AuthSync";

export default async function SnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  // Middleware handles cookie-missing case, but double-check here
  if (!user) {
    redirect("/login");
  }

  return (
    <AuthSync user={user}>
      <div className="fixed inset-0 md:relative md:inset-auto md:min-h-screen bg-white dark:bg-black flex flex-col max-w-md mx-auto">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-y-auto md:pb-14">{children}</main>
        <BottomNav avatarUrl={user.avatar_url ?? null} />
      </div>
    </AuthSync>
  );
}
