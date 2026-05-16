"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";

// People land here from the link in the password-reset email.
// /auth/callback exchanges the code first, so they arrive with a session.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setChecking(false);
    });
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("密碼至少要 6 個字喔");
      return;
    }
    if (password !== confirm) {
      setError("兩次輸入的密碼不一樣喔");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => {
        router.push("/home");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err?.message || "沒能更新密碼，連結可能過期了，請重新申請一次"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6">
      <div className="paper relative w-full max-w-[390px] overflow-hidden rounded-[36px] px-7 pb-10 pt-14 shadow-[0_8px_32px_rgba(40,30,22,0.2)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="animate-floaty">
            <Mochi mood={done ? "loving" : "calm"} size={96} />
          </div>
          <h1 className="mt-3 flex items-center gap-1.5 text-2xl font-semibold text-cocoa-deep">
            <Bow size={22} /> 設定新密碼
          </h1>
        </div>

        {checking ? (
          <p className="py-8 text-center text-sm text-milktea">確認中…</p>
        ) : !hasSession ? (
          <div className="text-center">
            <p className="text-[13px] leading-relaxed text-cocoa">
              這個連結無效或已經過期了。
              <br />
              回到登入頁，重新申請一次重設信吧。
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-cocoa mt-5 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft"
            >
              回登入頁
            </button>
          </div>
        ) : done ? (
          <p className="py-8 text-center text-sm font-medium text-cocoa-deep">
            密碼更新好了！正在帶你進去… 🌱
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
                新密碼
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 個字"
                className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
                再輸入一次
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="確認新密碼"
                className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-dusty/25 px-3 py-2 text-xs text-cocoa-deep">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-cocoa mt-1 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
            >
              {loading ? "更新中…" : "更新密碼 ✨"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
