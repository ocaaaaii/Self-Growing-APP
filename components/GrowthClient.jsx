"use client";

import Bow from "./Bow";
import { ACHIEVEMENTS } from "@/lib/constants";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// dot colour by how many habits were completed that day
function dotClass(count) {
  if (count >= 4) return "bg-sage";   // 超棒
  if (count >= 2) return "bg-butter"; // 完成大部分
  if (count === 1) return "bg-dusty"; // 有完成一些
  return null;
}

export default function GrowthClient({
  year,
  month,
  todayDate,
  dayCounts,
  totalPoints,
  longestStreak,
  growthDays,
  habitCount,
  gratitudeCount = 0,
  redeemCount = 0,
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun

  // completion rate this month: active days / days elapsed
  const activeDays = Object.keys(dayCounts).length;
  const completionRate =
    todayDate > 0 ? Math.round((activeDays / todayDate) * 100) : 0;

  // achievement unlock status, computed from the user's data
  const stats = {
    totalPoints,
    longestStreak,
    growthDays,
    habitCount,
    gratitudeCount,
    redeemCount,
  };
  const badges = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: a.check(stats),
  }));
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="animate-fadeIn px-[22px] pb-[100px] pt-2">
      <div className="mb-[18px] mt-1.5">
        <div className="font-hand text-lg text-milktea">my growth</div>
        <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
          慢慢變好的<span className="underline-cute">證據</span> 🌷
        </h1>
      </div>

      {/* month header */}
      <div className="mb-3.5 mt-4 flex items-center justify-between">
        <div className="font-hand text-2xl text-cocoa-deep">
          {MONTH_NAMES[month]} {year}
        </div>
      </div>

      {/* weekday labels */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold tracking-wide text-milktea"
          >
            {w}
          </div>
        ))}
      </div>

      {/* calendar */}
      <div className="grid grid-cols-7 gap-1.5 rounded-xl2 border border-line/40 bg-cream-card p-4 shadow-soft">
        {cells.map((d, idx) => {
          if (d === null) return <div key={`e${idx}`} />;
          const count = dayCounts[d] || 0;
          const dot = dotClass(count);
          const isToday = d === todayDate;
          return (
            <div
              key={d}
              className={`flex aspect-square items-center justify-center rounded-full text-[11px] transition ${
                dot ? `${dot} text-cocoa-deep` : "bg-milktea-soft text-cocoa"
              } ${isToday ? "font-bold ring-2 ring-cocoa-deep" : "font-medium"}`}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-2 rounded-2xl border border-line/40 bg-cream-card px-4 py-3.5 shadow-soft">
        {[
          { c: "bg-sage", label: "超棒的一天" },
          { c: "bg-butter", label: "完成大部分" },
          { c: "bg-dusty", label: "有完成一些" },
          { c: "bg-milktea-soft", label: "還沒紀錄" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 text-[11px] text-milktea"
          >
            <span className={`h-3 w-3 rounded-full ${item.c}`} />
            {item.label}
          </div>
        ))}
      </div>

      {/* stats */}
      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {[
          { emoji: "📈", num: `${completionRate}%`, label: "本月活躍率" },
          { emoji: "⭐", num: totalPoints.toLocaleString(), label: "總點數" },
          { emoji: "🔥", num: longestStreak, label: "最長連續" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line/40 bg-cream-card p-3.5 text-center shadow-soft"
          >
            <div className="text-[22px]">{s.emoji}</div>
            <div className="mt-1 text-lg font-bold text-cocoa-deep">{s.num}</div>
            <div className="mt-0.5 text-[10px] text-milktea">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-line/40 bg-cream-card px-4 py-3.5 shadow-soft">
        <div className="flex items-center gap-2 text-[13px] text-cocoa">
          <span className="text-lg">🌷</span> 累積成長天數
        </div>
        <div className="font-hand text-2xl font-bold text-cocoa-deep">
          {growthDays} 天
        </div>
      </div>

      {/* achievement badges */}
      <div className="mb-3 mt-[26px] flex items-baseline justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-cocoa-deep">
          <Bow size={18} /> 成就徽章
          <span className="font-hand text-lg text-cocoa-soft">badges</span>
        </h2>
        <span className="text-xs text-milktea">
          {unlockedCount} / {badges.length} 解鎖
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((b) => (
          <div
            key={b.key}
            className={`flex flex-col items-center rounded-[16px] border p-2.5 text-center transition ${
              b.unlocked
                ? "border-line/40 bg-cream-card shadow-soft"
                : "border-line/30 bg-cream-card/40"
            }`}
          >
            <div
              className={`text-[26px] ${
                b.unlocked ? "" : "opacity-30 grayscale"
              }`}
            >
              {b.emoji}
            </div>
            <div
              className={`mt-1 text-[11px] font-semibold ${
                b.unlocked ? "text-cocoa-deep" : "text-milktea"
              }`}
            >
              {b.title}
            </div>
            <div className="mt-0.5 text-[9px] leading-tight text-milktea">
              {b.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-milktea">
        <Bow size={14} />
        {growthDays === 0
          ? "完成第一個習慣，就會在這裡留下紀錄"
          : "每一個圓點，都是你照顧自己的證明"}
      </div>
    </div>
  );
}
