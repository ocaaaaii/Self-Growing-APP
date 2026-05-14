"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // 暱稱會傳進 auth metadata，trigger 會用它建立 profile
            data: { username: nickname.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        // If email confirmation is OFF, a session exists right away.
        if (data.session) {
          router.push("/home");
          router.refresh();
        } else {
          setNotice("確認信已寄到你的信箱～點開信裡的連結就完成註冊囉 💌");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/home");
        router.refresh();
      }
    } catch (err) {
      const msg = err?.message || "發生了一點問題，再試一次看看";
      // friendlier messages for common cases
      if (msg.includes("Invalid login credentials")) {
        setError("email 或密碼不太對喔，再檢查一下");
      } else if (msg.includes("already registered")) {
        setError("這個 email 已經註冊過了，直接登入吧");
      } else if (msg.includes("at least 6")) {
        setError("密碼至少要 6 個字喔");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6">
      <div className="paper relative w-full max-w-[390px] overflow-hidden rounded-[36px] px-7 pb-10 pt-14 shadow-[0_8px_32px_rgba(92,67,50,0.18)]">
        {/* mascot + title */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="animate-floaty">
            <Mochi mood="happy" size={96} />
          </div>
          <h1 className="mt-3 flex items-center gap-1.5 text-2xl font-semibold text-cocoa-deep">
            <Bow size={22} /> 慢慢變好
          </h1>
          <p className="mt-1 font-hand text-lg text-cocoa-soft">
            把自己養成喜歡的樣子
          </p>
        </div>

        {/* mode toggle */}
        <div className="mb-5 flex gap-1 rounded-2xl bg-beige/60 p-1">
          {[
            { k: "login", label: "登入" },
            { k: "signup", label: "註冊" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => {
                setMode(t.k);
                setError("");
                setNotice("");
              }}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                mode === t.k
                  ? "bg-cream-card text-cocoa-deep shadow-soft"
                  : "text-milktea"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
                暱稱
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="想讓 mochi 怎麼稱呼你？"
                className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
              密碼
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

          {error && (
            <div className="rounded-xl bg-dusty/25 px-3 py-2 text-xs text-[#9c5b52]">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl bg-sage/25 px-3 py-2 text-xs text-[#5e7044]">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#A47854,#8B5E3F)" }}
          >
            {loading
              ? "請稍等…"
              : mode === "signup"
              ? "建立我的帳號 🌱"
              : "進來繼續成長 ✨"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-milktea">
          {mode === "signup"
            ? "註冊就會有一個只屬於你的成長空間"
            : "歡迎回來，mochi 一直在等你"}
        </p>
      </div>
    </main>
  );
}
