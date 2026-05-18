"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayStr } from "@/lib/constants";
import Modal from "./Modal";
import Mochi from "./Mochi";

export default function WeeklyReviewModal({
  open,
  onClose,
  onSave,
  saving,
  weekStart,      // "YYYY-MM-DD" (週一)
}) {
  const supabase = createClient();
  const [proudMoment, setProudMoment] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!open || !weekStart) return;
    setLoadingStats(true);

    // 週末 = weekStart + 6 天
    const ws = new Date(weekStart);
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    const weekEnd = todayStr(we);

    // 先取得 user，再查資料
    supabase.auth.getUser().then(({ data: { user } }) => {
      const uid = user?.id;
      if (!uid) return;

    Promise.all([
      supabase
        .from("habit_logs")
        .select("habit_id, points_earned, completed_on")
        .eq("user_id", uid)
        .gte("completed_on", weekStart)
        .lte("completed_on", weekEnd),
      supabase
        .from("habits")
        .select("id, title, emoji, frequency, schedule_days")
        .eq("user_id", uid)
        .eq("is_archived", false),
      supabase
        .from("gratitude_entries")
        .select("id, points_earned")
        .eq("user_id", uid)
        .gte("entry_date", weekStart)
        .lte("entry_date", weekEnd),
    ]).then(([logsRes, habitsRes, gratRes]) => {
      const logs = logsRes.data || [];
      const habits = habitsRes.data || [];
      const grats = gratRes.data || [];

      // 本週點數
      const habitPts = logs.reduce((s, l) => s + l.points_earned, 0);
      const gratPts = grats.reduce((s, g) => s + (g.points_earned ?? 20), 0);
      const weeklyPoints = habitPts + gratPts;

      // 各習慣完成次數
      const countMap = {};
      logs.forEach((l) => {
        countMap[l.habit_id] = (countMap[l.habit_id] || 0) + 1;
      });

      // 最穩 / 最漏（只看有打過卡的習慣）
      const sorted = habits
        .map((h) => ({ ...h, count: countMap[h.id] || 0 }))
        .filter((h) => h.frequency !== "自由");

      const best = sorted.reduce((a, b) => (a.count >= b.count ? a : b), sorted[0] || null);
      const worst = sorted.reduce(
        (a, b) => (a.count <= b.count ? a : b),
        sorted[0] || null
      );

      // 打卡總次數
      const totalDone = logs.length;

      setStats({ weeklyPoints, totalDone, best, worst });
      setLoadingStats(false);
    });
    }); // end getUser
  }, [open, weekStart]);

  function handleSave() {
    if (!proudMoment.trim()) return;
    onSave(proudMoment.trim());
    setProudMoment("");
  }

  function handleClose() {
    setProudMoment("");
    onClose();
  }

  // 週幾文字（週一 ~ 週日）
  const weekLabel = weekStart
    ? (() => {
        const ws = new Date(weekStart);
        const we = new Date(ws);
        we.setDate(ws.getDate() + 6);
        return `${ws.getMonth() + 1}/${ws.getDate()} – ${we.getMonth() + 1}/${we.getDate()}`;
      })()
    : "";

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <button
        onClick={handleClose}
        className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
      >
        ✕
      </button>

      {/* header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="shrink-0 animate-floaty">
          <Mochi mood="loving" size={48} />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-snug text-cocoa-deep">
            本週回顧 🌸
          </h2>
          <p className="mt-0.5 text-xs text-milktea">{weekLabel}</p>
        </div>
      </div>

      {/* weekly stats */}
      {loadingStats ? (
        <div className="mb-4 flex h-20 items-center justify-center text-sm text-milktea">
          計算中…
        </div>
      ) : stats ? (
        <div className="mb-4">
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="rounded-[14px] border border-line/40 bg-cream-card px-3.5 py-3 text-center">
              <div className="text-xl font-bold text-cocoa-deep">+{stats.weeklyPoints}</div>
              <div className="text-[10px] text-milktea">本週點數</div>
            </div>
            <div className="rounded-[14px] border border-line/40 bg-cream-card px-3.5 py-3 text-center">
              <div className="text-xl font-bold text-cocoa-deep">{stats.totalDone}</div>
              <div className="text-[10px] text-milktea">打卡次數</div>
            </div>
          </div>

          {stats.best && stats.best.count > 0 && (
            <div className="mb-2 flex items-center gap-2.5 rounded-[14px] border border-line/40 bg-cream-card px-3.5 py-2.5">
              <span className="text-xl">{stats.best.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-milktea">這週最穩的一個 ✨</p>
                <p className="truncate text-[13px] font-semibold text-cocoa-deep">{stats.best.title}</p>
              </div>
              <span className="text-xs text-cocoa-soft">{stats.best.count}次</span>
            </div>
          )}

          {stats.worst && stats.worst !== stats.best && (
            <div className="flex items-center gap-2.5 rounded-[14px] border border-line/40 bg-cream-card px-3.5 py-2.5">
              <span className="text-xl">{stats.worst.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-milktea">這週比較不穩 🌱</p>
                <p className="truncate text-[13px] font-semibold text-cocoa-deep">{stats.worst.title}</p>
              </div>
              <span className="text-xs text-cocoa-soft">{stats.worst.count}次</span>
            </div>
          )}
        </div>
      ) : null}

      {/* proud moment */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          這週我最驕傲的一件事 🎀
        </label>
        <textarea
          value={proudMoment}
          onChange={(e) => setProudMoment(e.target.value)}
          placeholder="不用很大，可以只是堅持了一個習慣，或對自己說了一句溫柔的話…"
          rows={4}
          className="w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm leading-relaxed text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      {/* points hint */}
      <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-beige/60 px-3.5 py-2.5">
        <span className="text-base">✨</span>
        <p className="text-[12px] text-cocoa-soft">
          完成本週回顧，得到{" "}
          <span className="font-semibold text-cocoa-deep">+15 pt</span>
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !proudMoment.trim()}
        className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? "儲存中…" : "完成本週回顧 🌸"}
      </button>

      <button
        onClick={handleClose}
        className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
      >
        先跳過
      </button>
    </Modal>
  );
}
