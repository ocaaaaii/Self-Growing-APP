import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/log-error — stores one client-side error in public.error_logs
// (insert-only RLS, rate-limited by a trigger). Read them in the Supabase
// dashboard. Never throws back at the page: logging must not cause new errors.
const SOURCES = ["client", "boundary", "global"];
const clip = (v, n) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = clip(body?.message, 1000);
  if (!message) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("error_logs").insert({
      user_id: user?.id ?? null,
      source: SOURCES.includes(body?.source) ? body.source : "client",
      message,
      stack: clip(body?.stack, 4000),
      url: clip(body?.url, 300),
      user_agent: clip(request.headers.get("user-agent"), 300),
      digest: clip(body?.digest, 100),
    });
    if (error && !/error_logs_rate_limited/.test(error.message)) {
      console.error("[log-error] insert failed", error.message);
    }
  } catch (err) {
    console.error("[log-error]", err?.message);
  }
  return NextResponse.json({ ok: true });
}
