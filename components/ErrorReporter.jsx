"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/reportError";

// Catches errors nothing else handled (uncaught exceptions and rejected
// promises) and records them in error_logs.
export default function ErrorReporter() {
  useEffect(() => {
    const onError = (e) => {
      // ignore failed <img>/<script> loads (no error object) and cross-origin "Script error."
      if (!e?.error && (!e?.message || e.message === "Script error.")) return;
      reportError(e.error || e.message, { source: "client" });
    };
    const onRejection = (e) => reportError(e?.reason || "Unhandled promise rejection", { source: "client" });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
