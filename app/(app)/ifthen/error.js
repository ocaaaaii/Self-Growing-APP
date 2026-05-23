"use client";

import { useEffect } from "react";

// Catches client-side exceptions in the /ifthen route segment.
// Shows the real error message so we can diagnose it.
export default function IfThenError({ error, reset }) {
  useEffect(() => {
    console.error("[IfThen error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 text-4xl">😵</div>
      <h2 className="mb-1 text-base font-semibold text-cocoa-deep">
        If-Then 頁面發生錯誤
      </h2>
      <p className="mb-4 text-xs text-milktea leading-relaxed">
        {error?.message || "未知錯誤"}
      </p>
      <pre className="mb-4 max-w-full overflow-auto rounded-xl bg-beige px-3 py-2 text-left text-[10px] text-cocoa whitespace-pre-wrap break-all">
        {error?.stack?.slice(0, 500)}
      </pre>
      <button
        onClick={reset}
        className="rounded-2xl bg-cocoa px-5 py-2.5 text-sm font-semibold text-cream-card"
      >
        重試
      </button>
    </div>
  );
}
