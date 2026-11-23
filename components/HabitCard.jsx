"use client";

import Icon from "./Icon";
import { iconFor } from "@/lib/icons";

// One habit row.
// Only the checkbox logs the habit (no more accidental check-offs from a
// stray tap on the card). Tapping the rest of the row opens the habit.
const ICON_BG = {
  健康: "bg-sage/45",
  學習: "bg-dusty/45",
  工作: "bg-sky/50",
  生活: "bg-beige",
  心靈: "bg-cheek/40",
  不要做: "bg-milktea-soft",
};

// Streaks are only worth pointing out once they mean something.
const STREAK_MIN = 3;

export default function HabitCard({
  habit,
  done,
  busy,
  onToggle,
  onEdit,
  onCalendar, // 有傳才顯示日曆按鈕
  showMeta = true,
}) {
  const bgClass = ICON_BG[habit.category] || "bg-beige";
  const icon = iconFor(habit.emoji, habit.category);

  return (
    <div
      className={`flex items-center gap-2 rounded-[18px] border border-line/40 py-2 pl-2 pr-1 shadow-soft transition ${
        done ? "bg-cream-card/55" : "bg-cream-card"
      }`}
    >
      <button
        type="button"
        onClick={() => onEdit?.(habit)}
        disabled={!onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[14px] p-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50 disabled:cursor-default"
        aria-label={onEdit ? `編輯「${habit.title}」` : undefined}
      >
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-cocoa-deep ${bgClass} ${
            done ? "opacity-60" : ""
          }`}
        >
          <Icon name={icon} size={20} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-[15px] font-semibold leading-snug ${
              done ? "text-muted line-through decoration-1" : "text-cocoa-deep"
            }`}
          >
            {habit.title}
          </span>
          {showMeta && (
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="font-semibold text-accent">+{habit.point_value} pt</span>
              <span aria-hidden="true">·</span>
              <span>{habit.frequency}</span>
              {habit.streak >= STREAK_MIN && (
                <span className="flex items-center gap-0.5 font-semibold text-accent">
                  <Icon name="flame" size={13} />
                  連續 {habit.streak} 天
                </span>
              )}
            </span>
          )}
        </span>
      </button>

      {onCalendar && (
        <button
          type="button"
          onClick={() => onCalendar(habit)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-beige hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
          aria-label={`「${habit.title}」的打卡日曆`}
        >
          <Icon name="calendar" size={18} />
        </button>
      )}

      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={habit.title}
        aria-busy={busy || undefined}
        onClick={(e) => !busy && onToggle(habit, e)}
        className="group flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-[9px] border-2 transition ${
            done
              ? "border-cocoa bg-cocoa text-cream-card"
              : "border-muted/60 bg-cream-paper group-hover:border-accent"
          } ${busy ? "animate-pulseSoft" : ""}`}
        >
          {done && <Icon name="check" size={16} strokeWidth={2.6} />}
        </span>
      </button>
    </div>
  );
}
