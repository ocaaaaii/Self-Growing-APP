"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayStr } from "@/lib/constants";
import Modal from "./Modal";
import { useLocale } from "@/components/LocaleProvider";

function buildCalendarDays() {
  // 找到「今天 - 34 天」所在週的週日，確保 grid 對齊
  const today = new Date();
  const anchor = new Date(today);
  anchor.setDate(today.getDate() - 34);
  anchor.setDate(anchor.getDate() - anchor.getDay()); // 退到週日

  const days = [];
  const cur = new Date(anchor);
  while (cur <= today) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  // 補齊到 7 的倍數（尾部）
  while (days.length % 7 !== 0) {
    const ext = new Date(cur);
    days.push(ext);
    cur.setDate(cur.getDate() + 1);
  }
  return { days, todayStr: todayStr(today), futureFrom: days.indexOf(null) };
}

export default function HabitCalendarModal({ open, onClose, habit }) {
  const { t } = useLocale();
  const supabase = createClient();
  const [logSet, setLogSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !habit) return;
    setLoading(true);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 41); // 6 週緩衝
    const cutoffStr = todayStr(cutoff);

    supabase
      .from("habit_logs")
      .select("completed_on")
      .eq("habit_id", habit.id)
      .gte("completed_on", cutoffStr)
      .then(({ data }) => {
        setLogSet(new Set((data || []).map((l) => l.completed_on)));
        setLoading(false);
      });
  }, [open, habit]);

  if (!habit) return null;

  const DOW_LABELS = [
    t("calendar.days_sun"), t("calendar.days_mon"), t("calendar.days_tue"),
    t("calendar.days_wed"), t("calendar.days_thu"), t("calendar.days_fri"),
    t("calendar.days_sat"),
  ];

  const { days } = buildCalendarDays();
  const todayDateStr = todayStr(new Date());

  // 計算打卡率（只算過去 35 天）
  const past35 = days.filter((d) => {
    const ds = todayStr(d);
    return ds <= todayDateStr;
  }).slice(-35);
  const doneIn35 = past35.filter((d) => logSet.has(todayStr(d))).length;
  const rate = past35.length > 0 ? Math.round((doneIn35 / past35.length) * 100) : 0;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <button
        onClick={onClose}
        className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
      >
        ✕
      </button>

      {/* header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-beige text-2xl">
          {habit.emoji}
        </div>
        <div>
          <h2 className="text-base font-semibold text-cocoa-deep">{habit.title}</h2>
          <p className="text-xs text-milktea">{t("calendar.title")}</p>
        </div>
      </div>

      {/* stats row */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1 rounded-[14px] border border-line/40 bg-cream-card px-3 py-2.5 text-center">
          <div className="text-[18px] font-bold text-cocoa-deep">{doneIn35}</div>
          <div className="text-[10px] text-milktea">{t("calendar.completions")}</div>
        </div>
        <div className="flex-1 rounded-[14px] border border-line/40 bg-cream-card px-3 py-2.5 text-center">
          <div className="text-[18px] font-bold text-cocoa-deep">{rate}%</div>
          <div className="text-[10px] text-milktea">{t("calendar.rate")}</div>
        </div>
        <div className="flex-1 rounded-[14px] border border-line/40 bg-cream-card px-3 py-2.5 text-center">
          <div className="text-[18px] font-bold text-cocoa-deep">🔥 {habit.streak}</div>
          <div className="text-[10px] text-milktea">{t("calendar.streak")}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center text-sm text-milktea">
          {t("common.loading")}
        </div>
      ) : (
        <>
          {/* day-of-week labels */}
          <div className="mb-1.5 grid grid-cols-7">
            {DOW_LABELS.map((l) => (
              <div key={l} className="text-center text-[9px] font-semibold text-milktea">
                {l}
              </div>
            ))}
          </div>

          {/* calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const ds = todayStr(d);
              const isFuture = ds > todayDateStr;
              const done = !isFuture && logSet.has(ds);
              const isToday = ds === todayDateStr;

              return (
                <div
                  key={idx}
                  className={`flex aspect-square items-center justify-center rounded-full text-[10px] font-medium transition ${
                    isFuture
                      ? "opacity-0 pointer-events-none"
                      : done
                      ? "bg-sage text-cream-card"
                      : "bg-milktea-soft/50 text-cocoa"
                  } ${isToday ? "ring-2 ring-cocoa-deep" : ""}`}
                >
                  {isFuture ? "" : d.getDate()}
                </div>
              );
            })}
          </div>

          {/* legend */}
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-milktea">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-sage" /> {t("calendar.legend_done")}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-milktea-soft/50" /> {t("calendar.legend_none")}
            </span>
          </div>
        </>
      )}
    </Modal>
  );
}
