import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GrowthClient from "@/components/GrowthClient";

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
    // 折