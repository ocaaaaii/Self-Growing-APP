"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

/**
 * PWA install / share-to-homescreen banner.
 *
 * - Chrome/Edge/Android: listens for `beforeinstallprompt`, shows "安裝 App" button.
 * - iOS Safari: detects iOS + not-standalone, shows share-icon guide.
 * - Auto-shows once after first home visit (checked via localStorage).
 * - Dismissable with ✕ (stored in localStorage).
 */

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

const DISMISSED_KEY = "pwa-install-dismissed";

export default function InstallBanner() {
  const { t } = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch (_) {}

    if (isInStandaloneMode()) return;

    const ios = isIos();
    if (ios) {
      setTimeout(() => {
        setShowIosGuide(true);
        setVisible(true);
      }, 1800);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch (_) {}
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      try { localStorage.setItem(DISMISSED_KEY, "1"); } catch (_) {}
    }
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="animate-slideUp fixed bottom-0 left-0 right-0 z-[60] sm:absolute"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-[390px] rounded-t-[24px] border-t border-line/50 bg-cream-paper px-5 py-4 shadow-[0_-4px_24px_rgba(40,30,22,0.15)]">
        {/* dismiss */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-beige text-[11px] text-cocoa"
        >
          ✕
        </button>

        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="app icon"
            className="h-12 w-12 flex-shrink-0 rounded-[14px] shadow-soft"
          />

          <div className="flex-1">
            <div className="text-[13px] font-semibold text-cocoa-deep">
              慢慢變好 · Self Growing
            </div>

            {showIosGuide ? (
              <>
                <p className="mt-0.5 text-[12px] leading-relaxed text-milktea">
                  {t("installBanner.iosDesc")}
                </p>
                <p className="mt-2 flex items-center gap-1 rounded-xl bg-beige px-3 py-2 text-[11px] text-cocoa">
                  {t("installBanner.iosInstruction")}
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-[12px] leading-relaxed text-milktea">
                  {t("installBanner.installDesc")}
                </p>
                <button
                  onClick={handleInstall}
                  className="btn-cocoa mt-2.5 rounded-2xl px-5 py-2 text-[13px] font-semibold shadow-soft"
                >
                  {t("installBanner.installBtn")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
