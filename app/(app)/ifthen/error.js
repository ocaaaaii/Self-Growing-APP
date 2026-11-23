"use client";

import { useEffect } from "react";
import Mochi from "@/components/Mochi";
import { useT } from "@/components/LocaleProvider";

// Catches client-side exceptions in the /ifthen route segment.
// The technical details go to the console; the person gets a way back.
export default function IfThenError({ error, reset }) {
  const t = useT();
  useEffect(() => {
    console.error("[IfThen error]", error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Mochi mood="sad" size={88} />
      <h2 className="mb-1 mt-3 text-base font-semibold text-cocoa-deep">
        {t("ui.ifthenErrorTitle")}
      </h2>
      <p className="mb-5 max-w-[260px] text-sm leading-relaxed text-muted">
        {t("ui.ifthenErrorBody")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-cocoa rounded-2xl px-6 py-3 text-sm font-semibold shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
      >
        {t("ui.reload")}
      </button>
    </div>
  );
}
