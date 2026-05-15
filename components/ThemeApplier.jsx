"use client";

import { useEffect } from "react";

// Applies the user's saved theme to <html data-theme="...">.
// Rendered by the (app) layout with the theme from their profile.
export default function ThemeApplier({ theme }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme || "oat";
  }, [theme]);
  return null;
}
