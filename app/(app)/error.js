"use client";

import { useEffect } from "react";
import Mochi from "@/components/Mochi";
import { useT } from "@/components/LocaleProvider";
import { reportError } from "@/lib/reportError";

// Error page for every signed-in route that doesn't have its own.
// The details go to error_logs; the person gets a way back.
export default function AppError({ error, reset }) {
  const t = useT();
  useEffect(() => {
    console.error("[App error]", error);
    reportError(error, { source: "boundary" });
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Mochi mood="sad" size={88} />
      <h2 className="mb-1 mt-3 text-base font-semibold text-cocoa-deep">{t("ui.pageErrorTitle")}</h2>
      <p className="mb-5 max-w-[280px] text-sm leading-relaxed text-muted">{t("ui.pageErrorBody")}</p>
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
