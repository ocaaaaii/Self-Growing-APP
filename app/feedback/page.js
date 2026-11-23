"use client";

import { useState } from "react";
import Link from "next/link";
import Mochi from "@/components/Mochi";

const CATEGORIES = [
  { value: "idea", label: "功能建議" },
  { value: "bug", label: "問題回報" },
  { value: "account", label: "帳號與隱私（例如刪除帳號）" },
  { value: "other", label: "其他" },
];
const MAX = 2000;

export default function FeedbackPage() {
  const [category, setCategory] = useState("idea");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!message.trim()) {
      setError("請先寫下你想告訴我們的事。");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          replyEmail,
          website,
          page: typeof document !== "undefined" ? document.referrer.slice(0, 200) : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("idle");
        setError(
          data.error === "email"
            ? "Email 格式看起來不太對，可以再確認一下，或留空。"
            : data.error === "busy"
            ? "短時間內送出太多次了，請過一會兒再試。"
            : "沒能送出，請稍後再試一次。"
        );
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("沒能送出，可能是網路不太穩，請再試一次。");
    }
  }

  return (
    <main className="min-h-screen bg-cream-bg px-5 py-10 text-cocoa-deep">
      <div className="mx-auto max-w-[560px] rounded-[24px] bg-cream-card px-6 py-8 shadow-soft">
        <p className="font-hand text-lg text-muted">Mochi 慢慢變好</p>
        <h1 className="mt-1 text-2xl font-bold">意見回饋</h1>

        {status === "sent" ? (
          <div role="status" className="mt-8 flex flex-col items-center text-center">
            <Mochi mood="loving" size={88} />
            <h2 className="mt-3 text-lg font-bold">收到了，謝謝你</h2>
            <p className="mt-1 max-w-[320px] text-sm leading-relaxed text-muted">
              我們會仔細看每一則回饋。如果你有留下 Email，需要時會回信給你。
            </p>
            <Link href="/home" className="btn-cocoa mt-6 rounded-2xl px-6 py-3 text-sm font-semibold shadow-soft">
              回到 App
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              想法、遇到的問題、想刪除帳號，都可以在這裡告訴我們。
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="fb-category" className="mb-1.5 block text-xs font-semibold text-accent">
                  類型
                </label>
                <select
                  id="fb-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream-paper px-3 py-3 text-[15px] outline-none focus:border-cocoa-soft"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fb-message" className="mb-1.5 block text-xs font-semibold text-accent">
                  想說的話
                </label>
                <textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
                  rows={6}
                  required
                  placeholder="例如：希望可以依時段排序習慣／打卡後畫面沒有更新…"
                  className="w-full resize-y rounded-xl border border-line bg-cream-paper px-3 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted focus:border-cocoa-soft"
                />
                <p className="mt-1 text-right text-xs tabular-nums text-muted">{message.length} / {MAX}</p>
              </div>

              <div>
                <label htmlFor="fb-email" className="mb-1.5 block text-xs font-semibold text-accent">
                  Email（選填，想收到回覆再填）
                </label>
                <input
                  id="fb-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={replyEmail}
                  onChange={(e) => setReplyEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream-paper px-3 py-3 text-[15px] outline-none focus:border-cocoa-soft"
                />
              </div>

              {/* honeypot: hidden from people, bots tend to fill it */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="fb-website">Website</label>
                <input id="fb-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-dusty/25 px-3 py-2 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
              >
                {status === "sending" ? "送出中…" : "送出回饋"}
              </button>
            </form>
          </>
        )}

        <nav className="mt-8 flex flex-wrap gap-4 border-t border-line/60 pt-5 text-sm">
          <Link href="/welcome" className="text-accent underline underline-offset-4">回到首頁</Link>
          <Link href="/privacy" className="text-accent underline underline-offset-4">隱私權政策</Link>
          <Link href="/terms" className="text-accent underline underline-offset-4">服務條款</Link>
        </nav>
      </div>
    </main>
  );
}
