"use client";

import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useT } from "./LocaleProvider";

// Floating "+" button — lives in the app shell (outside the scroll area)
// so it stays put while content scrolls. It dispatches an "app-fab" event;
// each page listens for it and opens its own "add" modal.
//
// Hidden on /growth (nothing to add there).
const LABELS = {
  "/home": "ui.addHabit",
  "/habits": "ui.addHabit",
  "/ifthen": "ui.addRule",
  "/rewards": "ui.addReward",
};

export default function Fab() {
  const pathname = usePathname();
  const t = useT();
  if (pathname === "/growth") return null;
  const label = t(LABELS[pathname] || "ui.add");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("app-fab"))}
      className="btn-cocoa absolute bottom-[86px] right-[16px] z-20 flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-lift transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa-deep/60 focus-visible:ring-offset-2"
      aria-label={label}
      title={label}
    >
      <Icon name="plus" size={24} strokeWidth={2.2} />
    </button>
  );
}
