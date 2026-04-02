'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** 예전 소통 탭 URL 호환: 공모전으로 이동 */
export default function ConnectRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/community/contests");
  }, [router]);

  return null;
}
