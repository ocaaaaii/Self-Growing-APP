"use client";

import { useEffect } from "react";
import { useT } from "./LocaleProvider";

// Sets the browser tab title in the viewer's language ("今天 · Mochi").
export default function DocTitle({ k }) {
  const t = useT();
  useEffect(() => {
    document.title = `${t(k)} · Mochi`;
  }, [t, k]);
  return null;
}
