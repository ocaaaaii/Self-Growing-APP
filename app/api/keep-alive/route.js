// Keep-alive：Vercel Cron 每天呼叫一次，對 Supabase 發一個很輕的查詢，
// 讓免費方案的專案不會因為「7 天沒有活動」被自動暫停（暫停後網站會 504）。
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // 有設定 CRON_SECRET 時，只接受 Vercel Cron 帶來的 Bearer token
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // 只取筆數、不取資料（RLS 下匿名會是 0 筆，但查詢仍會打到資料庫）
  const { error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
