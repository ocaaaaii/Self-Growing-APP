"use client";

import { useState, useEffect } from "react";

const REMEMBERED_EMAIL_KEY = "growing-app:lastEmail";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";

const LOCALES = [
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "zh-CN", label: "简体中文", flag: "🇨🇳" },
  { code: "en",    label: "English",  flag: "🇺🇸" },
  { code: "ja",    label: "日本語",   flag: "🇯🇵" },
  { code: "ko",    label: "한국어",   flag: "🇰🇷" },
  { code: "es",    label: "Español",  flag: "🇪🇸" },
  { code: "pt",    label: "Português",flag: "🇧🇷" },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [nickname, setNickname] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("zh-TW");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // 載入上次用過的 email（瀏覽器密碼管理員也會記得密碼）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {
      // 隱私模式等情況可能沒有 localStorage，忽略
    }
  }, []);

  function rememberEmail(addr) {
    try {
      if (addr) localStorage.setItem(REMEMBERED_EMAIL_KEY, addr);
    } catch {}
  }

  function switchMode(m) {
    setMode(m);
    setError("");
    setNotice("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "reset") {
        // 寄送重設密碼信
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setNotice("重設密碼的信已寄到你的信箱囉～點開信裡的連結就能設定新密碼 💌");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // 暱稱 + 語言會傳進 auth metadata，trigger 會用它建立 profile
            data: {
              username: nickname.trim() || email.split("@")[0],
              locale: selectedLocale,
            },
          },
        });
        if (error) throw error;
        rememberEmail(email);

        // 存進 localStorage，讓 LocaleProvider mount 時能立即套用
        try { localStorage.setItem("locale", selectedLocale); } catch {}

        if (data.session) {
          // 有立即 session → 直接寫進 profile
          await supabase.from("profiles").upsert(
            { id: data.session.user.id, locale: selectedLocale },
            { onConflict: "id" }
          );
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
        rememberEmail(email);
        router.push("/home");
        router.refresh();
      }
    } catch (err) {
      const msg = err?.message || "發生了一點問題，再試一次看看";
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

  const isReset = mode === "reset";

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6">
      <div className="paper relative w-full max-w-[390px] overflow-hidden rounded-[36px] px-7 pb-10 pt-14 shadow-[0_8px_32px_rgba(40,30,22,0.2)]">
        {/* mascot + title */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="animate-floaty">
            <Mochi mood={isReset ? "calm" : "happy"} size={96} />
          </div>
          <h1 className="mt-3 flex items-center gap-1.5 text-2xl font-semibold text-cocoa-deep">
            <Bow size={22} /> 慢慢變好
          </h1>
          <p className="mt-1 font-hand text-lg text-cocoa-soft">
            把自己養成喜歡的樣子
          </p>
        </div>

        {/* mode toggle — hidden in reset mode */}
        {!isReset && (
          <div className="mb-5 flex gap-1 rounded-2xl bg-beige/60 p-1">
            {[
              { k: "login", label: "登入" },
              { k: "signup", label: "註冊" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => switchMode(t.k)}
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
        )}

        {isReset && (
          <div className="mb-4 text-center">
            <h2 className="text-base font-semibold text-cocoa-deep">
              忘記密碼了嗎？
            </h2>
            <p className="mt-1 text-xs text-milktea">
              沒關係～輸入 email，我們寄一封重設信給你
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === "signup" && (
            <>
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
                  autoComplete="nickname"
                  className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
                />
              </div>

              {/* language picker */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold tracking-wide text-cocoa">
                  語言 / Language
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {LOCALES.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setSelectedLocale(loc.code);
                        try { localStorage.setItem("locale", loc.code); } catch {}
                      }}
                      className={`flex items-center gap-2 rounded-[14px] border px-3 py-2 text-xs font-medium transition active:scale-[0.97] ${
                        selectedLocale === loc.code
                          ? "border-cocoa bg-cocoa text-cream-card"
                          : "border-line bg-cream-card text-cocoa"
                      }`}
                    >
                      <span className="text-sm">{loc.flag}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
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
              autoComplete="email"
              className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
            />
          </div>

          {!isReset && (
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
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-dusty/25 px-3 py-2 text-xs text-cocoa-deep">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl bg-sage/25 px-3 py-2 text-xs text-cocoa">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cocoa mt-1 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
          >
            {loading
              ? "請稍等…"
              : isReset
              ? "寄送重設信 💌"
              : mode === "signup"
              ? "建立我的帳號 🌱"
              : "進來繼續成長 ✨"}
          </button>
        </form>

        {/* footer links */}
        {isReset ? (
          <button
            onClick={() => switchMode("login")}
            className="mt-4 w-full text-center text-xs font-medium text-cocoa-soft"
          >
            ← 返回登入
          </button>
        ) : (
          <>
            {mode === "login" && (
              <button
                onClick={() => switchMode("reset")}
                className="mt-4 w-full text-center text-xs font-medium text-cocoa-soft"
              >
                忘記密碼？
              </button>
            )}
            <p className="mt-3 text-center text-[11px] leading-relaxed text-milktea">
              {mode === "signup"
                ? "註冊就會有一個只屬於你的成長空間"
                : "歡迎回來，mochi 一直在等你"}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
