"use client";

// One habit row with a check-off box.
// Presentational — parent passes `done` and handles `onToggle`.
const ICON_BG = {
  健康: "#C5CDB0",
  學習: "#E8D5C8",
  生活: "#DDD0B8",
  心靈: "#E8D5C8",
  不要做: "#C5D2D6",
};

export default function HabitCard({ habit, done, busy, onToggle, showMeta = true }) {
  const bg = ICON_BG[habit.category] || "#DDD0B8";

  return (
    <div
      onClick={(e) => !busy && onToggle(habit, e)}
      className={`flex cursor-pointer items-center gap-3.5 rounded-[18px] border border-line/40 p-3.5 shadow-soft transition active:scale-[0.99] ${
        done
          ? "opacity-75"
          : "bg-cream-card hover:-translate-y-px hover:shadow-lift"
      }`}
      style={done ? { background: "linear-gradient(135deg,#EDE6D4,#E5DBC3)" } : undefined}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-[22px]"
        style={{ background: bg }}
      >
        {habit.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`mb-0.5 text-sm font-semibold ${
            done ? "text-milktea line-through" : "text-cocoa-deep"
          }`}
        >
          {habit.title}
        </div>
        {showMeta && (
          <div className="flex items-center gap-2 text-[11px] text-milktea">
            <span className="rounded-lg bg-cream-bg px-2 py-0.5 font-semibold text-cocoa">
              +{habit.point_value} pt
            </span>
            <span>{habit.frequency}</span>
            {habit.streak > 0 && (
              <span className="font-semibold text-[#C97B5C]">🔥 {habit.streak}</span>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[10px] border-2 transition ${
          done
            ? "border-cocoa bg-cocoa"
            : "border-milktea-soft bg-cream-paper hover:border-cocoa-soft"
        }`}
      >
        {done && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7l3 3 7-7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
