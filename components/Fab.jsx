"use client";

import { usePathname } from "next/navigation";

// Floating "+" button — lives in the app shell (outside the scroll area)
// so it stays put while content scrolls. It dispatches an "app-fab" event;
// each page listens for it and opens its own "add" modal.
//
// Hidden on /growth (nothing to add there).
export default function Fab() {
  const pathname = usePathname();
  if (pathname === "/growth") return null;

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("app-fab"))}
      className="btn-cocoa absolute bottom-[88px] right-[18px] z-20 flex h-[52px] w-[52px] items-center justify-center rounded-full text-[26px] shadow-lift transition hover:rotate-90 hover:scale-110"
      aria-label="新增"
    >
      +
    </button>
  );
}
