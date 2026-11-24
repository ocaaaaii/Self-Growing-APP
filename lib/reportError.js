// Sends one error to /api/log-error. Safe to call anywhere in the browser:
// it never throws, skips duplicates, and stops after a few per page load.
const MAX_PER_PAGE = 5;
let sent = 0;
const seen = new Set();

export function reportError(error, { source = "client", digest } = {}) {
  try {
    if (typeof window === "undefined") return;
    const message = String(error?.message || error || "Unknown error").slice(0, 1000);
    const key = `${source}:${message}`;
    if (seen.has(key) || sent >= MAX_PER_PAGE) return;
    seen.add(key);
    sent += 1;
    const payload = JSON.stringify({
      source,
      message,
      stack: typeof error?.stack === "string" ? error.stack.slice(0, 4000) : null,
      url: window.location.pathname.slice(0, 300),
      digest: digest || error?.digest || null,
    });
    fetch("/api/log-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // logging must never break the page
  }
}
