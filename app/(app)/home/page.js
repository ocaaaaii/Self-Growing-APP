import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/constants";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayStr();

  const [profileRes, habitsRes, todayLogsRes, gratTodayRes, gratHistoryRes] =
    await Promise.all([
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
    ]);

  const profile = profileRes.data;
  const habits = habitsRes.data || [];
  const todayLogs = todayLogsRes.data || [];

  return (
    <HomeClient
      initialPoints={profile?.total_points ?? 0}
      username={profile?.username || user.email.split("@")[0]}
      habits={habits}
      todayLogs={todayLogs}
      todayGratitude={gratTodayRes.data || null}
      gratitudeHistory={gratHistoryRes.data || []}
    />
  );
}
