import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocTitle from "@/components/DocTitle";
import GrowthClient from "@/components/GrowthClient";
import { zonedNow } from "@/lib/serverDate";

// Day-based stats from habit_logs. Prefers the growth_stats() SQL function;
// if it isn't installed yet, pages through the rows (1000 at a time) instead.
async function loadDayStats(supabase, userId, todayKey) {
  const { data, error } = await supabase.rpc("growth_stats", { p_today: todayKey });
  const row = Array.isArray(data) ? data[0] : data;
  if (!error && row) {
    return {
      growthDays: row.growth_days ?? 0,
      currentStreak: row.current_streak ?? 0,
      bestStreak: row.best_streak ?? 0,
    };
  }

  const days = new Set();
  for (let from = 0; from < 100000; from += 1000) {
    const { data: rows, error: e } = await supabase
      .from("habit_logs")
      .select("completed_on")
      .eq("user_id", userId)
      .lte("completed_on", todayKey)
      .order("completed_on", { ascending: true })
      .range(from, from + 999);
    if (e || !rows) break;
    rows.forEach((r) => days.add(r.completed_on));
    if (rows.length < 1000) break;
  }

  const toNum = (k) => Math.round(Date.parse(`${k}T00:00:00Z`) / 86400000);
  const nums = [...days].map(toNum).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i] - nums[i - 1] === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const today = toNum(todayKey);
  const set = new Set(nums);
  let cursor = set.has(today) ? today : today - 1;
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor -= 1;
  }
  return { growthDays: days.size, currentStreak: current, bestStreak: best };
}

export const metadata = { title: "成長紀錄" };

export default async function GrowthPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = zonedNow(); // the user's calendar day, not the server's (UTC)
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
  // growth days / current streak / best streak are computed in the database
  // (growth_stats) so a long history isn't cut off at the API's 1000-row limit.
  const todayKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const dayStats = await loadDayStats(supabase, user.id, todayKey);
  const growthDays = dayStats.growthDays;
  const currentStreak = dayStats.currentStreak;
  // Best streak ever, for badges: once earned, a streak badge stays unlocked.
  const bestStreak = Math.max(
    dayStats.bestStreak,
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
