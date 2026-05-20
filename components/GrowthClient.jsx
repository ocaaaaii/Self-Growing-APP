"use client";

import Bow from "./Bow";
import { ACHIEVEMENTS } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";

// SVG 折線圖元件（過去 14 天每日點數）
function PointsChart({ data }) {
  if (!data || data.length < 2) return null;

  const W = 320, H = 100;
  const PL = 28, PR = 8, PT = 8, PB = 22;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const n = data.length;

  const values = data.map((d) => d.pts);
  const maxV = Math.max(...values, 5);

  const px = (i) => PL + (i / (n - 1)) * chartW;
  const py = (v) => PT + chartH - (v / maxV) * chartH;

  const linePoints = data.map((d, i) => `${px(i)},${py(d.pts)}`).join(" ");
  const areaPoints = `${px(0)},${py(0)} ${linePoints} ${px(n - 1)},${py(0)}`;

  // Y 刻度：0、半、最大
  const yTicks = [0, Math.round(maxV / 2), maxV];
  // X 標籤：顯示第 1、第 7、第 14 天
  const xLabels = [0, 6, 13].filter((i) => i < n).map((i) => ({
    i,
    label: data[i]?.date?.slice(5).replace("-", "/") ?? "",
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: H, display: "block" }}
      aria-label="過去 14 天點數趨勢"
    >
      {/* Y 參考線 */}
      {yTicks.slice(1).map((v) => (
        <line
          key={v}
          x1={PL} x2={W - PR}
          y1={py(v)} y2={py(v)}
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {/* 面積填色 */}
      <polygon
        points={areaPoints}
        style={{ fill: "rgb(var(--c-sage) / 0.18)" }}
      />

      {/* 折線 */}
      <polyline
        points={linePoints}
        style={{ stroke: "rgb(var(--c-sage))", fill: "none" }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 資料點 */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={px(i)} cy={py(d.pts)} r={d.pts > 0 ? 3 : 2}
          style={{ fill: d.pts > 0 ? "rgb(var(--c-sage))" : "rgb(var(--c-milktea-soft))" }}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {/* Y 軸標籤 */}
      {yTicks.map((v) => (
        <text
          key={v}
          x={PL - 4} y={py(v) + 4}
          textAnchor="end"
          fontSize="8"
          style={{ fill: "rgb(var(--c-milktea))" }}
        >
          {v}
        </text>
      ))}

      {/* X 軸標籤 */}
      {xLabels.map(({ i, label }) => (
        <text
          key={i}
          x={px(i)} y={H - 4}
          textAnchor="middle"
          fontSize="8"
          style={{ fill: "rgb(var(--c-milktea))" }}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

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
  dailyPoints = [],
}) {
  const { t } = useLocale();
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
        <div className="font-hand text-lg text-milktea">{t("growth.handwriting")}</div>
        <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
          {t("growth.title")}
        </h1>
        <p className="mt-1 text-[13px] text-milktea">
          {t("growth.subtitle")}
        </p>
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
          { c: "bg-sage", key: "legend_great" },
          { c: "bg-butter", key: "legend_most" },
          { c: "bg-dusty", key: "legend_some" },
          { c: "bg-milktea-soft", key: "legend_no_record" },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 text-[11px] text-milktea"
          >
            <span className={`h-3 w-3 rounded-full ${item.c}`} />
            {t(`growth.${item.key}`)}
          </div>
        ))}
      </div>

      {/* stats */}
      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {[
          { emoji: "📈", num: `${completionRate}%`, label: t("growth.monthlyRate") },
          { emoji: "⭐", num: totalPoints.toLocaleString(), label: t("growth.totalPoints") },
          { emoji: "🔥", num: longestStreak, label: t("growth.longestStreak") },
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
          <span className="text-lg">🌷</span> {t("growth.growthDays")}
        </div>
        <div className="font-hand text-2xl font-bold text-cocoa-deep">
          {growthDays} {t("growth.days")}
        </div>
      </div>

      {/* 點數趨勢折線圖 */}
      {dailyPoints.length >= 2 && (
        <>
          <div className="mb-3 mt-[26px] flex items-baseline justify-between">
            <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-cocoa-deep">
              <Bow size={18} /> {t("growth.pointsTrend")}
              <span className="font-hand text-lg text-cocoa-soft">{t("growth.last7days")}</span>
            </h2>
            <span className="text-xs text-milktea">
              {t("growth.maxPointsDay", { n: Math.max(...dailyPoints.map((d) => d.pts)) })}
            </span>
          </div>
          <div className="rounded-xl2 border border-line/40 bg-cream-card px-3 pb-2 pt-3 shadow-soft">
            <PointsChart data={dailyPoints} />
          </div>
        </>
      )}

      {/* achievement badges */}
      <div className="mb-3 mt-[26px] flex items-baseline justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-cocoa-deep">
          <Bow size={18} /> {t("growth.achievements")}
          <span className="font-hand text-lg text-cocoa-soft">badges</span>
        </h2>
        <span className="text-xs text-milktea">
          {t("growth.unlockCount", { n: unlockedCount, total: badges.length })}
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
            <div className={`mt-1 text-[8px] font-semibold ${b.unlocked ? "text-sage" : "text-milktea opacity-60"}`}>
              {b.unlocked ? t("growth.unlocked") : t("growth.locked")}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-milktea">
        <Bow size={14} />
        {growthDays === 0 ? t("growth.footerEmpty") : t("growth.footerHas")}
      </div>
    </div>
  );
}
