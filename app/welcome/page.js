"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";
import { loadMessages, getMessage, DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

// ─────────────────────────────────────────────
// Locale hook — reads localStorage (same key as the app),
// falls back to browser language, then zh-TW.
// ─────────────────────────────────────────────
function useWelcomeLocale() {
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    let locale = DEFAULT_LOCALE;
    try {
      const stored = localStorage.getItem("locale");
      if (stored && LOCALES.find((l) => l.code === stored)) {
        locale = stored;
      } else {
        // auto-detect from browser
        const nav = navigator.language || "";
        if (nav.startsWith("zh-TW") || nav.startsWith("zh-Hant")) locale = "zh-TW";
        else if (nav.startsWith("zh")) locale = "zh-CN";
        else if (nav.startsWith("ja")) locale = "ja";
        else if (nav.startsWith("ko")) locale = "ko";
        else if (nav.startsWith("es")) locale = "es";
        else if (nav.startsWith("pt")) locale = "pt";
        else if (nav.startsWith("en")) locale = "en";
      }
    } catch (_) {}
    loadMessages(locale).then(setMessages);
  }, []);

  function t(key, vars) {
    if (!messages) return "";
    return getMessage(messages, key, vars);
  }

  return t;
}

// ─────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────
function Feature({ emoji, text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2 text-left text-[12px] leading-snug text-cocoa">
      <span className="mt-px text-base leading-none">{emoji}</span>
      <span>{text}</span>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="rounded-full bg-beige/70 px-2.5 py-0.5 text-[10px] font-semibold text-cocoa">
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Slides — built dynamically from t()
// ─────────────────────────────────────────────
function buildSlides(t) {
  return [
    // 0 — Welcome
    {
      mood: "happy",
      tag: t("welcome.s0_tag"),
      title: t("welcome.s0_title"),
      subtitle: t("welcome.s0_sub"),
      body: t("welcome.s0_body"),
      extra: null,
    },
    // 1 — Habits
    {
      mood: "cheer",
      tag: t("welcome.s1_tag"),
      title: t("welcome.s1_title"),
      body: t("welcome.s1_body"),
      extra: (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
          <Feature emoji="🟢" text={t("welcome.s1_f1")} />
          <Feature emoji="🟡" text={t("welcome.s1_f2")} />
          <Feature emoji="🔴" text={t("welcome.s1_f3")} />
          <Feature emoji="🔥" text={t("welcome.s1_f4")} />
        </div>
      ),
    },
    // 2 — Frequency
    {
      mood: "happy",
      tag: t("welcome.s2_tag"),
      title: t("welcome.s2_title"),
      body: t("welcome.s2_body"),
      extra: (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
          <Feature emoji="📆" text={t("welcome.s2_f1")} />
          <Feature emoji="💼" text={t("welcome.s2_f2")} />
          <Feature emoji="🗓️" text={t("welcome.s2_f3")} />
          <Feature emoji="🎲" text={t("welcome.s2_f4")} />
          <Feature emoji="📊" text={t("welcome.s2_f5")} />
        </div>
      ),
    },
    // 3 — If→Then
    {
      mood: "cheer",
      tag: t("welcome.s3_tag"),
      title: t("welcome.s3_title"),
      body: t("welcome.s3_body"),
      extra: (
        <div className="mt-3 rounded-2xl bg-cream-card/70 p-3.5">
          <div className="mb-2 text-[11px] font-semibold text-cocoa-soft">
            {t("welcome.s3_label")}
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-xl bg-beige/60 px-3 py-2 text-[12px] leading-snug text-cocoa-deep">
              <span className="font-bold text-cocoa-soft">{t("welcome.s3_if")} </span>
              {t("welcome.s3_ex1_if")}<br />
              <span className="font-bold text-cocoa-soft">{t("welcome.s3_then")} </span>
              {t("welcome.s3_ex1_then")}
            </div>
            <div className="rounded-xl bg-beige/60 px-3 py-2 text-[12px] leading-snug text-cocoa-deep">
              <span className="font-bold text-cocoa-soft">{t("welcome.s3_if")} </span>
              {t("welcome.s3_ex2_if")}<br />
              <span className="font-bold text-cocoa-soft">{t("welcome.s3_then")} </span>
              {t("welcome.s3_ex2_then")}
            </div>
          </div>
        </div>
      ),
    },
    // 4 — Rewards
    {
      mood: "loving",
      tag: t("welcome.s4_tag"),
      title: t("welcome.s4_title"),
      body: t("welcome.s4_body"),
      extra: (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
          <Feature emoji="☕" text={t("welcome.s4_f1")} />
          <Feature emoji="👗" text={t("welcome.s4_f2")} />
          <Feature emoji="🎡" text={t("welcome.s4_f3")} />
          <Feature emoji="🎁" text={t("welcome.s4_f4")} />
        </div>
      ),
    },
    // 5 — Gratitude + Reflection
    {
      mood: "loving",
      tag: t("welcome.s5_tag"),
      title: t("welcome.s5_title"),
      body: t("welcome.s5_body"),
      extra: (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
          <Feature emoji="🌿" text={t("welcome.s5_f1")} />
          <Feature emoji="🌙" text={t("welcome.s5_f2")} />
          <Feature emoji="📅" text={t("welcome.s5_f3")} />
          <Feature emoji="📋" text={t("welcome.s5_f4")} />
          <Feature emoji="🏖️" text={t("welcome.s5_f5")} />
        </div>
      ),
    },
    // 6 — Growth
    {
      mood: "happy",
      tag: t("welcome.s6_tag"),
      title: t("welcome.s6_title"),
      body: t("welcome.s6_body"),
      extra: (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
          <Feature emoji="🗓️" text={t("welcome.s6_f1")} />
          <Feature emoji="📊" text={t("welcome.s6_f2")} />
          <Feature emoji="⭐" text={t("welcome.s6_f3")} />
          <Feature emoji="🏅" text={t("welcome.s6_f4")} />
        </div>
      ),
    },
    // 7 — Personalise
    {
      mood: "cheer",
      tag: t("welcome.s7_tag"),
      title: t("welcome.s7_title"),
      body: t("welcome.s7_body"),
      extra: (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip>🍵 奶茶</Chip>
          <Chip>🌿 薄荷</Chip>
          <Chip>🌸 櫻花</Chip>
          <Chip>☀️ 暖陽</Chip>
          <Chip>🌊 深海</Chip>
          <Chip>🌲 森林</Chip>
          <Chip>🌑 夜貓</Chip>
          <Chip>⬛ 碳黑</Chip>
          <div className="mt-1 w-full text-[11px] text-milktea">
            {t("welcome.s7_lang")}
          </div>
        </div>
      ),
    },
    // 8 — CTA
    {
      mood: "loving",
      tag: t("welcome.s8_tag"),
      title: t("welcome.s8_title"),
      body: t("welcome.s8_body"),
      extra: null,
    },
  ];
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function WelcomePage() {
  const router = useRouter();
  const t = useWelcomeLocale();
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  // wait for messages to load so slides don't flash empty
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const slides = buildSlides(t);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  function goTo(next) {
    setStep(next);
  }

  if (!ready) {
    return (
      <main className="flex h-[100dvh] w-full items-center justify-center">
        <div className="text-2xl animate-floaty">🌱</div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] w-full flex-col items-center justify-center sm:min-h-screen sm:h-auto sm:px-3 sm:py-6">
      <div
        className="paper relative flex h-full w-full flex-col overflow-hidden sm:h-auto sm:min-h-[780px] sm:max-w-[390px] sm:rounded-[36px] sm:shadow-[0_8px_32px_rgba(92,67,50,0.18)]"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* skip */}
        <button
          onClick={() => router.push("/login")}
          className="absolute right-6 z-10 text-xs font-medium text-milktea"
          style={{ top: "calc(24px + env(safe-area-inset-top))" }}
        >
          {t("welcome.skip")}
        </button>

        {/* scrollable slide area */}
        <div className="no-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-auto px-7 pb-4 pt-10 text-center">
          <div className="animate-floaty flex-shrink-0" key={step}>
            <Mochi mood={slide.mood} size={120} />
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-beige/70 px-3 py-1 text-[11px] font-semibold text-cocoa">
            <Bow size={13} /> {slide.tag}
          </div>

          <h1 className="mt-3 text-[22px] font-semibold leading-snug text-cocoa-deep">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <div className="font-hand text-lg text-milktea">{slide.subtitle}</div>
          )}

          <p className="mt-2.5 max-w-[300px] text-[13px] leading-relaxed text-cocoa">
            {slide.body}
          </p>

          {slide.extra && <div className="w-full max-w-[310px]">{slide.extra}</div>}
        </div>

        {/* dots + nav */}
        <div className="flex-shrink-0 px-7 pb-7">
          <div className="mb-4 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-cocoa" : i < step ? "w-2 bg-cocoa/40" : "w-2 bg-milktea-soft"
                }`}
                aria-label={`${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2.5">
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                className="rounded-2xl bg-beige px-5 py-3.5 text-sm font-semibold text-cocoa"
              >
                {t("welcome.prev")}
              </button>
            )}
            <button
              onClick={() => (isLast ? router.push("/login") : goTo(step + 1))}
              className="flex-1 rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px active:scale-95"
              style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
            >
              {isLast ? t("welcome.start") : t("welcome.next")}
            </button>
          </div>

          {step === 0 && (
            <p className="mt-3.5 text-center text-[12px] text-milktea">
              {t("welcome.loginPrompt")}{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-cocoa underline underline-offset-2"
              >
                {t("welcome.loginLink")}
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
