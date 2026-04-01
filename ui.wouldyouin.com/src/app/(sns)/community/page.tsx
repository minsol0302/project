'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CommunityRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/community/contests");
  }, [router]);

  return null;
}

