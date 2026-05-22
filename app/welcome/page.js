"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";

// ─────────────────────────────────────────────
// Feature bullet helper
// ─────────────────────────────────────────────
function Feature({ emoji, text }) {
  return (
    <div className="flex items-start gap-2 text-left text-[12px] leading-snug text-cocoa">
      <span className="mt-px text-base leading-none">{emoji}</span>
      <span>{text}</span>
    </div>
  );
}

// Thin pill chip
function Chip({ children }) {
  return (
    <span className="rounded-full bg-beige/70 px-2.5 py-0.5 text-[10px] font-semibold text-cocoa">
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Slides
// ─────────────────────────────────────────────
const SLIDES = [
  // 0 — Welcome / Philosophy
  {
    mood: "happy",
    tag: "歡迎 👋",
    title: "慢慢變好",
    subtitle: "Self Growing",
    body: "這不是會逼你的生產力工具，而是用溫柔的獎勵機制，陪你慢慢把自己養成喜歡的樣子。小棕熊 mochi 會一路陪著你 🌱",
    extra: null,
  },

  // 1 — Habits
  {
    mood: "cheer",
    tag: "習慣 ✅",
    title: "建立習慣，每天打卡",
    subtitle: null,
    body: "把想養成的好習慣、想減少的壞習慣都寫下來。每完成一件，就會得到相應的點數。",
    extra: (
      <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
        <Feature emoji="🟢" text="簡單習慣 · 5 pt（eg. 喝一杯水、整理桌面）" />
        <Feature emoji="🟡" text="中等習慣 · 15 pt（eg. 運動 30 分鐘）" />
        <Feature emoji="🔴" text="困難習慣 · 30 pt（eg. 冥想 / 學習一小時）" />
        <Feature emoji="🔥" text="連續打卡累積 streak — 不要讓火焰熄滅！" />
      </div>
    ),
  },

  // 2 — Frequency + Calendar
  {
    mood: "happy",
    tag: "頻率 📅",
    title: "彈性的頻率設定",
    subtitle: null,
    body: "每個習慣都能設定適合自己的節奏，查看打卡日曆隨時確認進度。",
    extra: (
      <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
        <Feature emoji="📆" text="每日 — 每天都要完成" />
        <Feature emoji="💼" text="平日 — 週一到週五" />
        <Feature emoji="🗓️" text="每週自訂 — 選擇指定的幾天" />
        <Feature emoji="🎲" text="自由 — 任何時候想做就做" />
        <Feature emoji="📊" text="點擊日曆圖示，查看每個習慣的打卡紀錄" />
      </div>
    ),
  },

  // 3 — If-Then
  {
    mood: "cheer",
    tag: "If → Then ⚡",
    title: "讓好習慣自動發生",
    subtitle: null,
    body: "建立「如果…就…」的條件反射規則，不靠意志力，靠環境設計讓行為自動化。",
    extra: (
      <div className="mt-3 rounded-2xl bg-cream-card/70 p-3.5">
        <div className="mb-2 text-[11px] font-semibold text-cocoa-soft">範例規則 ✨</div>
        <div className="flex flex-col gap-2">
          <div className="rounded-xl bg-beige/60 px-3 py-2 text-[12px] leading-snug text-cocoa-deep">
            <span className="font-bold text-cocoa-soft">IF</span> 聽到鬧鐘響<br />
            <span className="font-bold text-cocoa-soft">THEN</span> 立刻雙腳落地，不賴床
          </div>
          <div className="rounded-xl bg-beige/60 px-3 py-2 text-[12px] leading-snug text-cocoa-deep">
            <span className="font-bold text-cocoa-soft">IF</span> 坐到辦公桌前<br />
            <span className="font-bold text-cocoa-soft">THEN</span> 先寫今日最重要的一件事
          </div>
        </div>
      </div>
    ),
  },

  // 4 — Rewards
  {
    mood: "loving",
    tag: "獎勵 🎀",
    title: "用點數寵愛自己",
    subtitle: null,
    body: "建立自己的獎勵清單，用累積的點數兌換你真心想要的東西。核心機制是 ——「我有努力，所以我值得」。",
    extra: (
      <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
        <Feature emoji="☕" text="小確幸 — 一杯咖啡、一塊蛋糕（100–300 pt）" />
        <Feature emoji="👗" text="物品 — 想很久的衣服 / 文具（500–1000 pt）" />
        <Feature emoji="🎡" text="體驗 — 看電影、旅行、美食（800–2000 pt）" />
        <Feature emoji="🎁" text="大獎勵 — 自訂任何夢想清單項目" />
      </div>
    ),
  },

  // 5 — Gratitude + Reflection
  {
    mood: "loving",
    tag: "感恩 & 復盤 🌙",
    title: "每日感恩 + 夜晚復盤",
    subtitle: null,
    body: "每天記下三件感謝的事，睡前寫下今天的反思，讓 mochi 給你一句溫柔的鼓勵 🐻",
    extra: (
      <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
        <Feature emoji="🌿" text="每日感恩卡 — 記錄三件值得感謝的事" />
        <Feature emoji="🌙" text="夜晚復盤 — 11:55 後開放，誠實面對自己 +10 pt" />
        <Feature emoji="📅" text="隔天補寫 — 昨天忘了？還可以補上" />
        <Feature emoji="📋" text="週回顧 — 寫下這週最驕傲的事 +15 pt" />
        <Feature emoji="🏖️" text="休息日 — 偶爾說「我今天需要休息」也沒關係" />
      </div>
    ),
  },

  // 6 — Growth page
  {
    mood: "happy",
    tag: "成長 📈",
    title: "看見自己的成長軌跡",
    subtitle: null,
    body: "成長頁會記錄你每一天的努力，成就徽章會在你達成里程碑時悄悄解鎖。",
    extra: (
      <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cream-card/70 p-3.5">
        <Feature emoji="🗓️" text="月曆熱度圖 — 一眼看出活躍的日子" />
        <Feature emoji="📊" text="點數趨勢折線圖 — 過去 14 天的成長曲線" />
        <Feature emoji="⭐" text="累積點數 / 最長連續天數 / 成長天數統計" />
        <Feature emoji="🏅" text="成就徽章 — 首次打卡、百日挑戰、達人…" />
      </div>
    ),
  },

  // 7 — Tips / Profile
  {
    mood: "cheer",
    tag: "個人化 🎨",
    title: "讓 App 更像你",
    subtitle: null,
    body: "在個人主題頁可以換主題色、設定語言、修改暱稱，打造專屬的成長空間。",
    extra: (
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip>🍵 奶茶</Chip>
        <Chip>🌿 薄荷</Chip>
        <Chip>🌸 櫻花</Chip>
        <Chip>☀️ 陽光</Chip>
        <Chip>🌊 海洋</Chip>
        <Chip>🌲 森林</Chip>
        <Chip>🍶 米白</Chip>
        <Chip>🌑 夜黑</Chip>
        <div className="mt-1 w-full text-[11px] text-milktea">
          · 支援 7 種語言：繁中 / 簡中 / EN / 日文 / 韓文 / ES / PT
        </div>
      </div>
    ),
  },

  // 8 — CTA
  {
    mood: "loving",
    tag: "開始 🌱",
    title: "準備好了嗎？",
    subtitle: null,
    body: "記得 —— 你不是被逼著成長，而是正在慢慢變成自己喜歡的樣子。一件小事、一個打卡，就是最好的開始。",
    extra: null,
  },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function goTo(next) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  return (
    <main className="flex h-[100dvh] w-full flex-col items-center justify-center sm:min-h-screen sm:h-auto sm:px-3 sm:py-6">
      <div className="paper relative flex h-full w-full flex-col overflow-hidden sm:h-auto sm:min-h-[780px] sm:max-w-[390px] sm:rounded-[36px] sm:shadow-[0_8px_32px_rgba(92,67,50,0.18)]"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* skip */}
        <button
          onClick={() => router.push("/login")}
          className="absolute right-6 top-6 z-10 text-xs font-medium text-milktea"
          style={{ top: "calc(24px + env(safe-area-inset-top))" }}
        >
          跳過 →
        </button>

        {/* scrollable slide area */}
        <div className="no-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-auto px-7 pb-4 pt-10 text-center">
          {/* mochi */}
          <div className="animate-floaty flex-shrink-0" key={step}>
            <Mochi mood={slide.mood} size={120} />
          </div>

          {/* tag */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-beige/70 px-3 py-1 text-[11px] font-semibold text-cocoa">
            <Bow size={13} /> {slide.tag}
          </div>

          {/* title */}
          <h1 className="mt-3 text-[22px] font-semibold leading-snug text-cocoa-deep">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <div className="font-hand text-lg text-milktea">{slide.subtitle}</div>
          )}

          {/* body */}
          <p className="mt-2.5 max-w-[300px] text-[13px] leading-relaxed text-cocoa">
            {slide.body}
          </p>

          {/* extra content */}
          {slide.extra && <div className="w-full max-w-[310px]">{slide.extra}</div>}
        </div>

        {/* dots + nav — fixed at bottom */}
        <div className="flex-shrink-0 px-7 pb-7">
          {/* dots */}
          <div className="mb-4 flex justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-cocoa"
                    : i < step
                    ? "w-2 bg-cocoa/40"
                    : "w-2 bg-milktea-soft"
                }`}
                aria-label={`第 ${i + 1} 頁`}
              />
            ))}
          </div>

          {/* buttons */}
          <div className="flex gap-2.5">
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                className="rounded-2xl bg-beige px-5 py-3.5 text-sm font-semibold text-cocoa"
              >
                ← 上一步
              </button>
            )}
            <button
              onClick={() => (isLast ? router.push("/login") : goTo(step + 1))}
              className="flex-1 rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))",
              }}
            >
              {isLast ? "開始我的成長 🌱" : "下一步 →"}
            </button>
          </div>

          {/* login shortcut */}
          {step === 0 && (
            <p className="mt-3.5 text-center text-[12px] text-milktea">
              已有帳號？{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-cocoa underline underline-offset-2"
              >
                直接登入
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
