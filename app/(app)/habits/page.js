import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/constants";
import HabitsClient from "@/components/HabitsClient";

export default async function HabitsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayStr();

  const [habitsRes, todayLogsRes] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", user.id)
      .eq("completed_on", today),
  ]);

  return (
    <HabitsClient
      habits={habitsRes.data || []}
      todayLogs={todayLogsRes.data || []}
    />
  );
}
