"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Mochi from "@/components/Mochi";
import Bow from "@/components/Bow";

// 登入前的導覽頁 — 一步一步介紹 App 怎麼用
const SLIDES = [
  {
    mood: "happy",
    emoji: "🌱",
    title: "歡迎來到「慢慢變好」",
    body: "這不是會逼你的生產力工具，而是用溫柔的獎勵機制，陪你慢慢把自己養成喜歡的樣子。小棕熊 mochi 會一路陪著你。",
    tag: "我們的理念",
  },
  {
    mood: "cheer",
    emoji: "✅",
    title: "建立習慣，每天打卡",
    body: "把想養成的好習慣、想減少的壞習慣寫下來。每完成一件，就會得到點數 —— 簡單 5 點、中等 15 點、困難 30 點。連續完成還會累積 streak 🔥",
    tag: "習慣 + 點數",
  },
  {
    mood: "loving",
    emoji: "🎀",
    title: "用點數寵愛自己",
    body: "建立自己的獎勵清單：一杯咖啡、一塊蛋糕、想很久的衣服…用累積的點數兌換。核心的心理機制是 ——「我有努力，所以我值得」。",
    tag: "獎勵兌換",
  },
  {
    mood: "happy",
    emoji: "💫",
    title: "讓好習慣自動發生",
    body: "If→Then 行為系統：建立「IF 觸發 → THEN 行動」的條件反射。例如「IF 聽到鬧鐘 → THEN 立刻雙腳落地」。不靠意志力，靠自動化。",
    tag: "If → Then 規則",
  },
  {
    mood: "loving",
    emoji: "🌷",
    title: "準備好了嗎？",
    body: "註冊一個只屬於你的成長空間，現在就開始。記得 —— 你不是被逼著成長，而是正在慢慢變成喜歡的自己。",
    tag: "開始吧",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6">
      <div className="paper relative flex min-h-[760px] w-full max-w-[390px] flex-col overflow-hidden rounded-[36px] px-7 pb-8 pt-10 shadow-[0_8px_32px_rgba(92,67,50,0.18)]">
        {/* skip */}
        <button
          onClick={() => router.push("/login")}
          className="absolute right-6 top-6 text-xs font-medium text-milktea"
        >
          跳過 →
        </button>

        {/* slide content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-floaty" key={step}>
            <Mochi mood={slide.mood} size={140} />
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-beige/70 px-3 py-1 text-[11px] font-semibold text-cocoa">
            <Bow size={14} /> {slide.tag}
          </div>

          <h1 className="mt-3 text-2xl font-semibold leading-snug text-cocoa-deep">
            {slide.emoji} {slide.title}
          </h1>
          <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-cocoa">
            {slide.body}
          </p>
        </div>

        {/* dots */}
        <div className="mb-5 flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-6 bg-cocoa" : "w-2 bg-milktea-soft"
              }`}
              aria-label={`第 ${i + 1} 頁`}
            />
          ))}
        </div>

        {/* buttons */}
        <div className="flex gap-2.5">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-2xl bg-beige px-5 py-3.5 text-sm font-semibold text-cocoa"
            >
              上一步
            </button>
          )}
          <button
            onClick={() => (isLast ? router.push("/login") : setStep(step + 1))}
            className="flex-1 rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
          >
            {isLast ? "開始我的成長 🌱" : "下一步"}
          </button>
        </div>
      </div>
    </main>
  );
}
