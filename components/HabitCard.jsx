"use client";

// One habit row with a check-off box.
// Presentational — parent passes `done` and handles `onToggle`.
const ICON_BG = {
  健康: "bg-sage",
  學習: "bg-dusty",
  生活: "bg-beige",
  心靈: "bg-cheek",
  不要做: "bg-sky",
};

export default function HabitCard({
  habit,
  done,
  busy,
  onToggle,
  onEdit,
  onCalendar,   // 有傳才顯示日曆按鈕
  showMeta = true,
}) {
  const bgClass = ICON_BG[habit.category] || "bg-beige";

  return (
    <div
      onClick={(e) => !busy && onToggle(habit, e)}
      className={`flex cursor-pointer items-center gap-3.5 rounded-[18px] border border-line/40 p-3.5 shadow-soft transition active:scale-[0.99] ${
        done
          ? "opacity-75"
          : "bg-cream-card hover:-translate-y-px hover:shadow-lift"
      }`}
      style={done ? { background: "linear-gradient(135deg, rgb(var(--c-beige)), rgb(var(--c-milktea-soft)))" } : undefined}
    >
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-[22px] ${bgClass}`}
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
              <span className="font-semibold text-cocoa-soft">🔥 {habit.streak}</span>
            )}
          </div>
        )}
      </div>

      {onCalendar && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCalendar(habit);
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-milktea transition hover:bg-beige hover:text-cocoa"
          aria-label="打卡日曆"
        >
          {/* calendar icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(habit);
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-milktea transition hover:bg-beige hover:text-cocoa"
          aria-label="編輯"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 20h4L18.5 9.5a2.12 2.12 0 00-3-3L5 17v3z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

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
