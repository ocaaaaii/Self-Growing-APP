"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Bottom-sheet style modal — slides up from the bottom of the phone frame.
// Dialog semantics: Esc closes, focus moves into the sheet, Tab stays inside,
// and focus returns to whatever opened it.
export default function Modal({ open, onClose, children, className = "", label }) {
  const sheetRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const sheet = sheetRef.current;

    // focus the first field if there is one, otherwise the sheet itself
    const first = sheet?.querySelector("input, textarea, select");
    (first || sheet)?.focus({ preventScroll: true });

    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const items = [...sheet.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    sheet?.addEventListener("keydown", onKey);
    return () => {
      sheet?.removeEventListener("keydown", onKey);
      if (opener && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-deep/40 backdrop-blur-sm sm:absolute"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative max-h-[90%] w-full overflow-y-auto rounded-t-xl3 bg-cream-paper px-[22px] pb-7 pt-[22px] outline-none animate-slideUp no-scrollbar ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

// The ✕ in the corner of every sheet.
export function CloseButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="關閉"
      className={`absolute right-[14px] top-[12px] flex h-10 w-10 items-center justify-center rounded-full text-accent transition hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
