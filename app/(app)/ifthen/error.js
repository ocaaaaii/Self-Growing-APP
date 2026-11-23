"use client";

import { useEffect } from "react";
import Mochi from "@/components/Mochi";

// Catches client-side exceptions in the /ifthen route segment.
// The technical details go to the console; the person gets a way back.
export default function IfThenError({ error, reset }) {
  useEffect(() => {
    console.error("[IfThen error]", error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Mochi mood="sad" size={88} />
      <h2 className="mb-1 mt-3 text-base font-semibold text-cocoa-deep">
        規則頁暫時打不開
      </h2>
      <p className="mb-5 max-w-[260px] text-sm leading-relaxed text-muted">
        你的規則都還在，沒有不見。通常重新載入一次就好；如果一直這樣，可能是網路不太穩。
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-cocoa rounded-2xl px-6 py-3 text-sm font-semibold shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
      >
        重新載入
      </button>
    </div>
  );
}
