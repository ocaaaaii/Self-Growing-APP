"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const FALLBACK_TZ = "Asia/Taipei"; // keep in sync with lib/serverDate.js

// Remembers the browser's time zone in a cookie so server-rendered pages
// compute "today" the same way the browser does (see lib/serverDate.js).
export default function TimezoneCookie() {
  const router = useRouter();
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;
      const raw = document.cookie.match(/(?:^|; )tz=([^;]*)/)?.[1];
      const current = raw ? decodeURIComponent(raw) : null;
      if (current === tz) return;
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
      // The server rendered this page with the old (or fallback) zone.
      // Re-render once if that zone was actually different.
      if ((current || FALLBACK_TZ) !== tz) router.refresh();
    } catch {}
  }, [router]);
  return null;
}
