import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/constants";
import HomeClient from "@/components/HomeClient";

function shouldShowOn(habit, dayOfWeek) {
  switch (habit.frequency) {
    case "每日": return true;
    case "平日": return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "每週自訂":
    case "每週 3 次": // backward compat for old habits
      return Array.isArray(habit.schedule_days) &&
        habit.schedule_days.length > 0 &&
        habit.schedule_days.includes(dayOfWeek);
    case "自由": return false;
    default: return true;
  }
}

// 計算本週週一（week start）
function getWeekStart(date) {
  const d = new Date(date);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow; // 退到週一
  d.setDate(d.getDate() + diff);
  return todayStr(d);
}

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const todayDate = new Date();
  const today = todayStr(todayDate);
  const dayOfWeek = todayDate.getDay();

  // 昨天
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = todayStr(yesterdayDate);
  const yesterdayDow = yesterdayDate.getDay();

  // 本週
  const weekStart = getWeekStart(todayDate);
  const isSunday = dayOfWeek === 0;

  // ── 穩定的查詢（這些表格一定存在）──
  const [
    profileRes,
    habitsRes,
    todayLogsRes,
    gratTodayRes,
    gratHistoryRes,
    yesterdayLogsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("habits").select("*").eq("user_id", user.id).eq("is_archived", false).order("created_at", { ascending: true }),
    supabase.from("habit_logs").select("habit_id, points_earned").eq("user_id", user.id).eq("completed_on", today),
    supabase.from("gratitude_entries").select("*").eq("user_id", user.id).eq("entry_date", today).maybeSingle(),
    supabase.from("gratitude_entries").select("id, entry_date, item_1, item_2, item_3").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(14),
    supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("completed_on", yesterday),
  ]);

  // ── 可能不存在的新表格（migration_schedule_reflection / migration_v4）──
  // 用個別 await + 錯誤判斷，不讓 Promise.all 爆掉
  let reflectionTodayData = null;
  let reflectionYesterdayData = null;
  let restDayTodayData = null;
  let weeklyReviewData = null;

  const reflTodayRes = await supabase
    .from("daily_reflections")
    .select("id")
    .eq("user_id", user.id)
    .eq("entry_date", today)
    .maybeSingle();
  if (!reflTodayRes.error) reflectionTodayData = reflTodayRes.data;

  const reflYestRes = await supabase
    .from("daily_reflections")
    .select("id")
    .eq("user_id", user.id)
    .eq("entry_date", yesterday)
    .maybeSingle();
  if (!reflYestRes.error) reflectionYesterdayData = reflYestRes.data;

  const restRes = await supabase
    .from("rest_days")
    .select("id")
    .eq("user_id", user.id)
    .eq("rest_date", today)
    .maybeSingle();
  if (!restRes.error) restDayTodayData = restRes.data;

  const weeklyRes = await supabase
    .from("weekly_reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (!weeklyRes.error) weeklyReviewData = weeklyRes.data;

  const allHabits = habitsRes.data || [];
  const todayHabits = allHabits.filter((h) => shouldShowOn(h, dayOfWeek));

  // 昨天未完成的習慣
  const yesterdayLogSet = new Set((yesterdayLogsRes.data || []).map((l) => l.habit_id));
  const yesterdayHabits = allHabits.filter((h) => shouldShowOn(h, yesterdayDow));
  const yesterdayIncomplete = yesterdayHabits.filter((h) => !yesterdayLogSet.has(h.id));
  const yesterdayNeedsReflection = !reflectionYesterdayData && yesterdayIncomplete.length > 0;

  const profile = profileRes.data;

  return (
    <HomeClient
      initialPoints={profile?.total_points ?? 0}
      username={profile?.username || user.email.split("@")[0]}
      habits={todayHabits}
      todayLogs={todayLogsRes.data || []}
      todayGratitude={gratTodayRes.data || null}
      gratitudeHistory={gratHistoryRes.data || []}
      todayReflectionDone={!!reflectionTodayData}
      yesterdayNeedsReflection={yesterdayNeedsReflection}
      yesterdayIncompleteHabits={yesterdayIncomplete}
      yesterdayStr={yesterday}
      todayIsRestDay={!!restDayTodayData}
      isSunday={isSunday}
      weekStart={weekStart}
      weeklyReviewDone={!!weeklyReviewData}
    />
  );
}
