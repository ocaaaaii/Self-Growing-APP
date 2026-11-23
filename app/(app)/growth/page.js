import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocTitle from "@/components/DocTitle";
import GrowthClient from "@/components/GrowthClient";

export const metadata = { title: "成長紀錄" };

export default async function GrowthPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const lastDay = new Date(year, month + 1, 0).getDate();
  const pad = (n) => String(n).padStart(2, "0");
  const firstOfMonth = `${year}-${pad(month + 1)}-01`;
  const lastOfMonth  = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

  // 過去 14 天的起點（折線圖用）
  const cutoffDate = new Date(now);
  cutoffDate.setDate(now.getDate() - 13);
  const pad2 = (n) => String(n).padStart(2, "0");
  const chartCutoff = `${cutoffDate.getFullYear()}-${pad2(cutoffDate.getMonth() + 1)}-${pad2(cutoffDate.getDate())}`;

  // ── 穩定的查詢（這些表格一定存在）──
  const [
    profileRes,
    habitsRes,
    monthLogsRes,
    allLogsRes,
    gratCountRes,
    redeemCountRes,
    chartHabitLogsRes,
    chartGratRes,
  ] = await Promise.all([
    supabase.from("profiles").select("total_points").eq("id", user.id).maybeSingle(),
    supabase.from("habits").select("streak").eq("user_id", user.id),
    supabase
      .from("habit_logs")
      .select("completed_on")
      .eq("user_id", user.id)
      .gte("completed_on", firstOfMonth)
      .lte("completed_on", lastOfMonth),
    supabase.from("habit_logs").select("completed_on").eq("user_id", user.id),
    supabase
      .from("gratitude_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("reward_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    // 折線圖：習慣點數
    supabase
      .from("habit_logs")
      .select("completed_on, points_earned")
      .eq("user_id", user.id)
      .gte("completed_on", chartCutoff),
    // 折線圖：感恩點數
    supabase
      .from("gratitude_entries")
      .select("entry_date, points_earned")
      .eq("user_id", user.id)
      .gte("entry_date", chartCutoff),
  ]);

  // ── 可能不存在的新表格（migration_v4 / migration_schedule_reflection）──
  // 用個別 await + 錯誤判斷，不讓 Promise.all 爆掉
  let reflectionRows = [];
  let restDayRows   = [];

  const reflRes = await supabase
    .from("daily_reflections")
    .select("entry_date, points_earned")
    .eq("user_id", user.id)
    .gte("entry_date", chartCutoff);
  if (!reflRes.error) reflectionRows = reflRes.data || [];

  const restRes = await supabase
    .from("rest_days")
    .select("rest_date, points_earned")
    .eq("user_id", user.id)
    .gte("rest_date", chartCutoff);
  if (!restRes.error) restDayRows = restRes.data || [];

  // ── 月曆：每天打卡次數 ──
  const dayCounts = {};
  (monthLogsRes.data || []).forEach((l) => {
    const d = Number(l.completed_on.slice(8, 10));
    dayCounts[d] = (dayCounts[d] || 0) + 1;
  });

  const habits       = habitsRes.data || [];
  const logDays      = new Set((allLogsRes.data || []).map((l) => l.completed_on));
  const growthDays   = logDays.size;

  // Current streak: consecutive days with at least one check-off, counting back
  // from today (or from yesterday, if today has nothing yet). The per-habit
  // `streak` column is only updated on check-off, so it goes stale after a
  // break and must not be shown as "current".
  const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const cursor = new Date(now);
  if (!logDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let currentStreak = 0;
  while (logDays.has(dayKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Best streak ever, for badges: once earned, a streak badge stays unlocked.
  // Longest run of consecutive log days, or the per-habit max if that is higher.
  const sortedDays = [...logDays].sort();
  let bestRun = 0;
  let run = 0;
  let prev = null;
  for (const k of sortedDays) {
    const d = new Date(`${k}T00:00:00`);
    run = prev && Math.round((d - prev) / 86400000) === 1 ? run + 1 : 1;
    bestRun = Math.max(bestRun, run);
    prev = d;
  }
  const bestStreak = Math.max(
    bestRun,
    habits.reduce((m, h) => Math.max(m, h.streak || 0), 0),
    currentStreak
  );

  // ── 折線圖：建立過去 14 天每日點數 ──
  const dailyMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    dailyMap[key] = 0;
  }

  (chartHabitLogsRes.data || []).forEach((l) => {
    if (dailyMap[l.completed_on] !== undefined)
      dailyMap[l.completed_on] += l.points_earned;
  });
  (chartGratRes.data || []).forEach((l) => {
    if (dailyMap[l.entry_date] !== undefined)
      dailyMap[l.entry_date] += l.points_earned ?? 20;
  });
  reflectionRows.forEach((l) => {
    if (dailyMap[l.entry_date] !== undefined)
      dailyMap[l.entry_date] += l.points_earned ?? 10;
  });
  restDayRows.forEach((l) => {
    if (dailyMap[l.rest_date] !== undefined)
      dailyMap[l.rest_date] += l.points_earned ?? 5;
  });

  const dailyPoints = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pts]) => ({ date, pts }));

  return (
    <>
      <DocTitle k="ui.titleGrowth" />
      <GrowthClient
      year={year}
      month={month}
      todayDate={now.getDate()}
      dayCounts={dayCounts}
      totalPoints={profileRes.data?.total_points ?? 0}
      currentStreak={currentStreak}
      longestStreak={bestStreak}
      growthDays={growthDays}
      habitCount={habits.length}
      gratitudeCount={gratCountRes.count ?? 0}
      redeemCount={redeemCountRes.count ?? 0}
      dailyPoints={dailyPoints}
    />
    </>
  );
}
