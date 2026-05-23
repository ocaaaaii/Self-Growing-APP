"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

const HINT_KEY = "guide-hint-shown";

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hint bubble — uses fixed positioning to escape any overflow:hidden parent.
 * Reads the button's bounding rect on mount to position itself below it.
 */
function HintBubble({ btnRef, onDismiss, t }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const el = btnRef?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    });
  }, [btnRef]);

  if (!pos) return null;

  return (
    <>
      {/* full-screen tap-away */}
      <div className="fixed inset-0 z-40" onClick={onDismiss} />

      {/* bubble — fixed so it is never clipped by overflow:hidden */}
      <div className="fixed z-50 animate-fadeIn" style={{ top: pos.top, right: pos.right }}>
        {/* upward arrow pointing to the button */}
        <div className="absolute -top-[7px] right-3 h-3.5 w-3.5 rotate-45 rounded-sm bg-cocoa-deep shadow-sm" />

        {/* card */}
        <div className="relative min-w-[170px] rounded-2xl bg-cocoa-deep px-4 py-3 shadow-lift">
          <p className="text-[12px] font-medium leading-snug text-cream-card">
            {t("guideHint.text")}
          </p>
          <button
            onClick={onDismiss}
            className="mt-2 flex w-full items-center justify-end gap-1 text-[11px] font-semibold text-cream-card/70 transition hover:text-cream-card"
          >
            {t("guideHint.dismiss")} ✓
          </button>
        </div>
      </div>
    </>
  );
}

export default function GuideButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [showHint, setShowHint] = useState(false);
  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  // On the habits page, the top-right already has a profile button.
  // Hide the mobile GuideButton there to avoid overlap.
  const hideMobile = pathname === "/habits";

  // Show hint once on first visit (after 800 ms delay)
  useEffect(() => {
    try {
      if (!localStorage.getItem(HINT_KEY)) {
        const show = setTimeout(() => setShowHint(true), 800);
        return () => clearTimeout(show);
      }
    } catch (_) {}
  }, []);

  // Auto-dismiss after 6 s
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(dismiss, 6000);
    return () => clearTimeout(timer);
  }, [showHint]);

  function dismiss() {
    setShowHint(false);
    try { localStorage.setItem(HINT_KEY, "1"); } catch (_) {}
  }

  function open() {
    dismiss();
    router.push("/welcome");
  }

  // Pick whichever button is currently visible for the hint anchor
  function visibleRef() {
    // On desktop (sm+) the desktop button is visible; on mobile the mobile button is.
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      return desktopRef;
    }
    return mobileRef;
  }

  return (
    <>
      {/* ── Desktop (sm+): absolute, overlaid on the status bar area ── */}
      <div
        className="absolute right-[60px] z-30 hidden sm:block"
        style={{ top: "14px" }}
      >
        <button
          ref={desktopRef}
          onClick={open}
          aria-label="功能導覽"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-milktea-soft/60 text-cocoa transition hover:bg-beige hover:scale-110"
        >
          <BookIcon />
        </button>
      </div>

      {/* ── Mobile: absolute top-right, safe-area aware ──
           Hidden on /habits (profile button already occupies that spot) */}
      <div
        className={`absolute right-4 z-30 sm:hidden ${hideMobile ? "hidden" : ""}`}
        style={{ top: "calc(10px + env(safe-area-inset-top))" }}
      >
        <button
          ref={mobileRef}
          onClick={open}
          aria-label="功能導覽"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-card/85 text-cocoa shadow-soft backdrop-blur-sm transition hover:scale-110"
        >
          <BookIcon />
        </button>
      </div>

      {/* Hint bubble — rendered once, anchored to the visible button */}
      {showHint && (
        <HintBubble btnRef={visibleRef()} onDismiss={dismiss} t={t} />
      )}
    </>
  );
}
