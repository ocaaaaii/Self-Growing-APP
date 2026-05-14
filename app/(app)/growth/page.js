import { createClient } from "@/lib/supabase/server";
import GrowthClient from "@/components/GrowthClient";

export default async function GrowthPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const lastDay = new Date(year, month + 1, 0).getDate();
  const pad = (n) => String(n).padStart(2, "0");
  const firstOfMonth = `${year}-${pad(month + 1)}-01`;
  const lastOfMonth = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

  const [profileRes, habitsRes, monthLogsRes, allLogsRes] = await Promise.all([
    supabase.from("profiles").select("total_points").eq("id", user.id).maybeSingle(),
    supabase.from("habits").select("streak").eq("user_id", user.id),
    supabase
      .from("habit_logs")
      .select("completed_on")
      .eq("user_id", user.id)
      .gte("completed_on", firstOfMonth)
      .lte("completed_on", lastOfMonth),
    supabase.from("habit_logs").select("completed_on").eq("user_id", user.id),
  ]);

  // count logs per day this month
  const dayCounts = {};
  (monthLogsRes.data || []).forEach((l) => {
    const d = Number(l.completed_on.slice(8, 10));
    dayCounts[d] = (dayCounts[d] || 0) + 1;
  });

  const habits = habitsRes.data || [];
  const longestStreak = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);
  const growthDays = new Set(
    (allLogsRes.data || []).map((l) => l.completed_on)
  ).size;

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
    />
  );
}
