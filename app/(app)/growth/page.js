import { createClient } from "@/lib/supabase/server";
import GrowthClient from "@/components/GrowthClient";
import { todayStr } from "@/lib/constants";

export default async function GrowthPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const pad = (n) => String(n).padStart(2, "0");
  const firstOfMonth = `${year}-${pad(month + 1)}-01`;
  const lastOfMonth = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

  // 過去 14 天（折線圖用）
  const chartCutoffDate = new Date(now);
  chartCutoffDate.setDate(now.getDate() - 13);
  const chartCutoff = todayStr(chartCutoffDate);

  const [
    profileRes, habitsRes, monthLogsRes, allLogsRes,
    gratCountRes, redeemCountRes,
    chartHabitLogsRes, chartGratRes, chartReflectionRes, chartRestRes,
  ] = await Promise.all([
    supabase.from("profiles").select("total_points").eq("id", user.id).maybeSingle(),
    supabase.from("habits").select("streak").eq("user_id", user.id),
    supabase.from("habit_logs").select("completed_on").eq("user_id", user.id).gte("completed_on", firstOfMonth).lte("completed_on", lastOfMonth),
    supabase.from("habit_logs").select("completed_on").eq("user_id", user.id),
    supabase.from("gratitude_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("reward_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    // 折線圖：過去 14 天逐日點數
    supabase.from("habit_logs").select("completed_on, points_earned").eq("user_id", user.id).gte("completed_on", chartCutoff),
    supabase.from("gratitude_entries").select("entry_date, points_earned").eq("user_id", user.id).gte("entry_date", chartCutoff),
    supabase.from("daily_reflections").select("entry_date, points_earned").eq("user_id", user.id).gte("entry_date", chartCutoff).catch(() => ({ data: [] })),
    supabase.from("rest_days").select("rest_date, points_earned").eq("user_id", user.id).gte("rest_date", chartCutoff).catch(() => ({ data: [] })),
  ]);

  // 月曆：每天打卡次數
  const dayCounts = {};
  (monthLogsRes.data || []).forEach((l) => {
    const d = Number(l.completed_on.slice(8, 10));
    dayCounts[d] = (dayCounts[d] || 0) + 1;
  });

  const habits = habitsRes.data || [];
  const longestStreak = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);
  const growthDays = new Set((allLogsRes.data || []).map((l) => l.completed_on)).size;

  // 折線圖：建立過去 14 天的日期陣列，每天加總所有來源的點數
  const dailyMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dailyMap[todayStr(d)] = 0;
  }

  (chartHabitLogsRes.data || []).forEach((l) => {
    if (dailyMap[l.completed_on] !== undefined) dailyMap[l.completed_on] += l.points_earned;
  });
  (chartGratRes.data || []).forEach((l) => {
    if (dailyMap[l.entry_date] !== undefined) dailyMap[l.entry_date] += (l.points_earned ?? 20);
  });
  (chartReflectionRes.data || []).forEach((l) => {
    if (dailyMap[l.entry_date] !== undefined) dailyMap[l.entry_date] += (l.points_earned ?? 10);
  });
  (chartRestRes.data || []).forEach((l) => {
    if (dailyMap[l.rest_date] !== undefined) dailyMap[l.rest_date] += (l.points_earned ?? 5);
  });

  const dailyPoints = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pts]) => ({ date, pts }));

  return (
    <GrowthClient
      year={year}
      month={month}
      todayDate={now.getDate()}
      dayCounts={dayCounts}
      totalPoints={profileRes.data?.total_points ?? 0}
      longestStreak={longestStreak}
      growthDays={growthDays}
      habitCount={habits.length}
      gratitudeCount={gratCountRes.count ?? 0}
      redeemCount={redeemCountRes.count ?? 0}
      dailyPoints={dailyPoints}
    />
  );
}
