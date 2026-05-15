import { createClient } from "@/lib/supabase/server";
import RewardsClient from "@/components/RewardsClient";

export default async function RewardsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, rewardsRes, historyRes] = await Promise.all([
    supabase.from("profiles").select("total_points").eq("id", user.id).maybeSingle(),
    supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("reward_history")
      .select("id, points_spent, redeemed_at, photo_url, note, rewards(title, emoji)")
      .eq("user_id", user.id)
      .order("redeemed_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <RewardsClient
      initialPoints={profileRes.data?.total_points ?? 0}
      rewards={rewardsRes.data || []}
      history={historyRes.data || []}
    />
  );
}
