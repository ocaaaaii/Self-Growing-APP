import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/constants";
import HomeClient from "@/components/HomeClient";

// 判斷某個習慣在指定星期幾是否應該出現在首頁
function shouldShowOn(habit, dayOfWeek) {
  switch (habit.frequency) {
    case "每日":
      return true;
    case "平日":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "每週 3 次":
      return (
        Array.isArray(habit.schedule_days) &&
        habit.schedule_days.length > 0 &&
        habit.schedule_days.includes(dayOfWeek)
      );
    case "自由":
      return false;
    default:
      return true;
  }
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayStr();
  const todayDate = new Date();
  const dayOfWeek = todayDate.getDay(); // 0=日…6=六

  // 昨天的日期
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = todayStr(yesterdayDate);
  const yesterdayDow = yesterdayDate.getDay();

  const [
    profileRes,
    habitsRes,
    todayLogsRes,
    gratTodayRes,
    gratHistoryRes,
    reflectionTodayRes,
    yesterdayLogsRes,
    reflectionYesterdayRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("habit_id, points_earned")
      .eq("user_id", user.id)
      .eq("completed_on", today),
    supabase
      .from("gratitude_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .maybeSingle(),
    supabase
      .from("gratitude_entries")
      .select("id, entry_date, item_1, item_2, item_3")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .limit(14),
    // 今天有沒有做過復盤
    supabase
      .from("daily_reflections")
      .select("id")
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .maybeSingle(),
    // 昨天的打卡紀錄
    supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", user.id)
      .eq("completed_on", yesterday),
    // 昨天有沒有做過復盤
    supabase
      .from("daily_reflections")
      .select("id")
      .eq("user_id", user.id)
      .eq("entry_date", yesterday)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const allHabits = habitsRes.data || [];
  const todayLogs = todayLogsRes.data || [];

  // 今天應顯示的習慣
  const todayHabits = allHabits.filter((h) => shouldShowOn(h, dayOfWeek));

  // 計算昨天有沒有未完成且未復盤
  const yesterdayLogSet = new Set((yesterdayLogsRes.data || []).map((l) => l.habit_id));
  const yesterdayHabits = allHabits.filter((h) => shouldShowOn(h, yesterdayDow));
  const yesterdayIncomplete = yesterdayHabits.filter((h) => !yesterdayLogSet.has(h.id));
  const yesterdayNeedsReflection =
    !reflectionYesterdayRes.data && yesterdayIncomplete.length > 0;

  return (
    <HomeClient
      initialPoints={profile?.total_points ?? 0}
      username={profile?.username || user.email.split("@")[0]}
      habits={todayHabits}
      todayLogs={todayLogs}
      todayGratitude={gratTodayRes.data || null}
      gratitudeHistory={gratHistoryRes.data || []}
      todayReflectionDone={!!reflectionTodayRes.data}
      yesterdayNeedsReflection={yesterdayNeedsReflection}
      yesterdayIncompleteHabits={yesterdayIncomplete}
      yesterdayStr={yesterday}
    />
  );
}
