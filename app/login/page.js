"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";
import { loadMessages, getMessage, DEFAULT_LOCALE } from "@/lib/i18n";

const REMEMBERED_EMAIL_KEY = "growing-app:lastEmail";

const LOCALES = [
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "zh-CN", label: "简体中文", flag: "🇨🇳" },
  { code: "en",    label: "English",  flag: "🇺🇸" },
  { code: "ja",    label: "日本語",   flag: "🇯🇵" },
  { code: "ko",    label: "한국어",   flag: "🇰🇷" },
  { code: "es",    label: "Español",  flag: "🇪🇸" },
  { code: "pt",    label: "Português",flag: "🇧🇷" },
];

// ── locale hook (same pattern as welcome page) ──────────────────────────────
function useLoginLocale() {
  const [messages, setMessages] = useState(null);
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    let detected = DEFAULT_LOCALE;
    try {
      const stored = localStorage.getItem("locale");
      if (stored && LOCALES.find((l) => l.code === stored)) {
        detected = stored;
      } else {
        const nav = navigator.language || "";
        if (nav.startsWith("zh-TW") || nav.startsWith("zh-Hant")) detected = "zh-TW";
        else if (nav.startsWith("zh")) detected = "zh-CN";
        else if (nav.startsWith("ja")) detected = "ja";
        else if (nav.startsWith("ko")) detected = "ko";
        else if (nav.startsWith("es")) detected = "es";
        else if (nav.startsWith("pt")) detected = "pt";
        else if (nav.startsWith("en")) detected = "en";
      }
    } catch (_) {}
    setLocaleState(detected);
    loadMessages(detected).then(setMessages);
  }, []);

  function changeLocale(code) {
    setLocaleState(code);
    try { localStorage.setItem("locale", code); } catch (_) {}
    loadMessages(code).then(setMessages);
  }

  function t(key) {
    if (!messages) return "";
    return getMessage(messages, key) || key;
  }

  return { t, locale, changeLocale };
}

// ────────────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, locale, changeLocale } = useLoginLocale();

  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [oauthFailed, setOauthFailed] = useState(false);

  // /auth/callback 換 session 失敗時會帶 ?error=auth 回來
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "auth") setOauthFailed(true);
    } catch {}
  }, []);

  // 載入上次用過的 email
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {}
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
    setOauthFailed(false);
  }

  async function handleGoogle() {
    setError("");
    setNotice("");
    setOauthFailed(false);
    setLoading(true);
    try { localStorage.setItem("locale", locale); } catch {}
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // 成功時瀏覽器會直接跳轉到 Google，不會回到這裡
    if (error) {
      setError(error.message || t("login.errGoogle"));
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setNotice(t("login.noticeResetSent"));
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: nickname.trim() || email.split("@")[0],
              locale,
            },
          },
        });
        if (error) throw error;
        rememberEmail(email);

        try { localStorage.setItem("locale", locale); } catch {}

        if (data.session) {
          await supabase.from("profiles").upsert(
            { id: data.session.user.id, locale },
            { onConflict: "id" }
          );
          router.push("/home");
          router.refresh();
        } else {
          setNotice(t("login.noticeSignupSent"));
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        rememberEmail(email);
        router.push("/home");
        router.refresh();
      }
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("Invalid login credentials")) {
        setError(t("login.errInvalidCredentials"));
      } else if (msg.includes("already registered")) {
        setError(t("login.errAlreadyRegistered"));
      } else if (msg.includes("at least 6")) {
        setError(t("login.errPasswordTooShort"));
      } else {
        setError(msg || t("login.errGeneric"));
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
            <Bow size={22} /> {t("login.title")}
          </h1>
          <p className="mt-1 font-hand text-lg text-muted">
            {t("login.subtitle")}
          </p>
        </div>

        {/* mode toggle */}
        {!isReset && (
          <div className="mb-5 flex gap-1 rounded-2xl bg-beige/60 p-1">
            {[
              { k: "login",  label: t("login.tabLogin") },
              { k: "signup", label: t("login.tabSignup") },
            ].map((tab) => (
              <button
                key={tab.k}
                onClick={() => switchMode(tab.k)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  mode === tab.k
                    ? "bg-cream-card text-cocoa-deep shadow-soft"
                    : "text-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {isReset && (
          <div className="mb-4 text-center">
            <h2 className="text-base font-semibold text-cocoa-deep">
              {t("login.resetTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {t("login.resetSubtitle")}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === "signup" && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
                  {t("login.labelNickname")}
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("login.placeholderNickname")}
                  autoComplete="nickname"
                  className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
                />
              </div>

              {/* language picker */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
                  {t("login.labelLanguage")}
                </label>
                <select
                  value={locale}
                  onChange={(e) => changeLocale(e.target.value)}
                  className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
                >
                  {LOCALES.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.flag} {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
              {t("login.labelEmail")}
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
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
                {t("login.labelPassword")}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.placeholderPassword")}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
              />
            </div>
          )}

          {oauthFailed && !error && (
            <div className="rounded-xl bg-dusty/25 px-3 py-2 text-xs text-cocoa-deep">
              {t("login.errGoogle")}
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-dusty/25 px-3 py-2 text-xs text-cocoa-deep">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl bg-sage/25 px-3 py-2 text-xs text-accent">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cocoa mt-1 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
          >
            {loading
              ? t("login.loading")
              : isReset
              ? t("login.submitReset")
              : mode === "signup"
              ? t("login.submitSignup")
              : t("login.submitLogin")}
          </button>
        </form>

        {/* Google 登入 */}
        {!isReset && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              {t("login.or")}
              <span className="h-px flex-1 bg-line" />
            </div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-line bg-cream-card py-3 text-sm font-semibold text-cocoa-deep shadow-soft transition hover:-translate-y-px hover:bg-white disabled:opacity-60"
            >
              <GoogleIcon />
              {t("login.continueWithGoogle")}
            </button>
          </>
        )}

        {/* footer links */}
        {isReset ? (
          <button
            onClick={() => switchMode("login")}
            className="mt-4 w-full text-center text-xs font-medium text-muted"
          >
            {t("login.backToLogin")}
          </button>
        ) : (
          <>
            {mode === "login" && (
              <>
                <button
                  onClick={() => switchMode("reset")}
                  className="mt-4 w-full text-center text-xs font-medium text-muted"
                >
                  {t("login.forgotPassword")}
                </button>
                <button
                  onClick={() => router.push("/welcome")}
                  className="mt-2 w-full text-center text-xs font-medium text-muted hover:text-accent transition"
                >
                  {t("login.seeIntro")}
                </button>
              </>
            )}
            <p className="mt-3 text-center text-xs leading-relaxed text-muted">
              {mode === "signup" ? t("login.signupHint") : t("login.welcomeBack")}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
