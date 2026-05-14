"use client";

import Bow from "./Bow";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// dot colour by how many habits were completed that day
function dotClass(count) {
  if (count >= 4) return { bg: "#A8B58E", text: "white" };   // 超棒
  if (count >= 2) return { bg: "#D8C580", text: "#5C4332" }; // 完成大部分
  if (count === 1) return { bg: "#D4A89E", text: "white" };  // 有完成一些
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
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun

  // completion rate this month: active days / days elapsed
  const activeDays = Object.keys(dayCounts).length;
  const completionRate =
    todayDate > 0 ? Math.round((activeDays / todayDate) * 100) : 0;

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
              className="flex aspect-square items-center justify-center rounded-full text-[11px] font-medium transition"
              style={{
                background: dot ? dot.bg : "#D8CFC2",
                color: dot ? dot.text : "#8B5E3F",
                boxShadow: isToday ? "0 0 0 2px #5C4332" : "none",
                fontWeight: isToday ? 700 : 500,
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-2 rounded-2xl border border-line/40 bg-cream-card px-4 py-3.5 shadow-soft">
        {[
          { c: "#A8B58E", label: "超棒的一天" },
          { c: "#D8C580", label: "完成大部分" },
          { c: "#D4A89E", label: "有完成一些" },
          { c: "#D8CFC2", label: "還沒紀錄" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 text-[11px] text-milktea"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: item.c }}
            />
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

      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-milktea">
        <Bow size={14} />
        {growthDays === 0
          ? "完成第一個習慣，就會在這裡留下紀錄"
          : "每一個圓點，都是你照顧自己的證明"}
      </div>
    </div>
  );
}
