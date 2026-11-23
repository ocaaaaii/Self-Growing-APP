"use client";

import { usePathname } from "next/navigation";
import Icon from "./Icon";

// Floating "+" button — lives in the app shell (outside the scroll area)
// so it stays put while content scrolls. It dispatches an "app-fab" event;
// each page listens for it and opens its own "add" modal.
//
// Hidden on /growth (nothing to add there).
const LABELS = {
  "/home": "新增習慣",
  "/habits": "新增習慣",
  "/ifthen": "新增規則",
  "/rewards": "新增獎勵",
};

export default function Fab() {
  const pathname = usePathname();
  if (pathname === "/growth") return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("app-fab"))}
      className="btn-cocoa absolute bottom-[86px] right-[16px] z-20 flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-lift transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa-deep/60 focus-visible:ring-offset-2"
      aria-label={LABELS[pathname] || "新增"}
      title={LABELS[pathname] || "新增"}
    >
      <Icon name="plus" size={24} strokeWidth={2.2} />
    </button>
  );
}
