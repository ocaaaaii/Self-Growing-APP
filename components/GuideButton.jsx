"use client";

import { useRouter } from "next/navigation";

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GuideButton() {
  const router = useRouter();

  function open() {
    router.push("/welcome");
  }

  return (
    <>
      {/* ── Desktop (sm+): lives inside the status-bar row ─────────────── */}
      {/* Rendered via flex in the status bar; see layout.js                */}
      <button
        onClick={open}
        aria-label="功能導覽"
        className="hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-milktea-soft/60 text-cocoa transition hover:bg-beige hover:scale-110"
      >
        <BookIcon />
      </button>

      {/* ── Mobile: absolutely positioned in top-right, safe-area aware ── */}
      <button
        onClick={open}
        aria-label="功能導覽"
        className="absolute right-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-cream-card/85 text-cocoa shadow-soft backdrop-blur-sm transition hover:scale-110 sm:hidden"
        style={{ top: "calc(10px + env(safe-area-inset-top))" }}
      >
        <BookIcon />
      </button>
    </>
  );
}
