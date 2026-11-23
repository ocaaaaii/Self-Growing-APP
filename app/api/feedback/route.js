import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/feedback — saves one message from the /feedback form.
// Rows land in public.feedback (insert-only RLS); read them in the Supabase dashboard.
const CATEGORIES = ["idea", "bug", "account", "other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // honeypot: real people never fill the hidden "website" field
  if (body?.website) return NextResponse.json({ ok: true });

  const message = String(body?.message ?? "").trim();
  const category = CATEGORIES.includes(body?.category) ? body.category : "other";
  const replyEmail = String(body?.replyEmail ?? "").trim();
  const page = String(body?.page ?? "").slice(0, 200) || null;

  if (message.length < 1 || message.length > 2000) {
    return NextResponse.json({ error: "message" }, { status: 400 });
  }
  if (replyEmail && (replyEmail.length > 200 || !EMAIL_RE.test(replyEmail))) {
    return NextResponse.json({ error: "email" }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    category,
    message,
    reply_email: replyEmail || null,
    page,
  });

  if (error) {
    console.error("[feedback] insert failed", error.message);
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
