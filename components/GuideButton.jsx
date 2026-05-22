"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

/** Arrow + bubble tooltip shown once on first login */
function HintBubble({ onDismiss, t }) {
  return (
    <>
      {/* full-screen tap-away */}
      <div className="fixed inset-0 z-40" onClick={onDismiss} />

      {/* bubble — positioned below + left of the trigger */}
      <div className="absolute right-0 top-full z-50 mt-2.5 animate-fadeIn">
        {/* upward arrow */}
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
  const { t } = useLocale();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(HINT_KEY)) {
        // Small delay so the page fully renders first
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

  return (
    <>
      {/* ── Desktop (sm+): sits inside the status-bar flex row ── */}
      <div className="relative hidden sm:block">
        <button
          onClick={open}
          aria-label="功能導覽"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-milktea-soft/60 text-cocoa transition hover:bg-beige hover:scale-110"
        >
          <BookIcon />
        </button>
        {showHint && <HintBubble onDismiss={dismiss} t={t} />}
      </div>

      {/* ── Mobile: absolute top-right, safe-area aware ── */}
      <div
        className="absolute right-4 z-30 sm:hidden"
        style={{ top: "calc(10px + env(safe-area-inset-top))" }}
      >
        <button
          onClick={open}
          aria-label="功能導覽"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-card/85 text-cocoa shadow-soft backdrop-blur-sm transition hover:scale-110"
        >
          <BookIcon />
        </button>
        {showHint && <HintBubble onDismiss={dismiss} t={t} />}
      </div>
    </>
  );
}
