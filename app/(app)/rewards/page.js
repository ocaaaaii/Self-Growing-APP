import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocTitle from "@/components/DocTitle";
import { REWARD_PHOTO_BUCKET, rewardPhotoPath } from "@/lib/rewardPhotos";
import RewardsClient from "@/components/RewardsClient";

export const metadata = { title: "獎勵" };

export default async function RewardsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
      .select(
        "id, points_spent, redeemed_at, photo_url, note, ai_comment, rewards(title, emoji)"
      )
      .eq("user_id", user.id)
      .order("redeemed_at", { ascending: false })
      .limit(20),
  ]);

  // Photos are private: swap each stored path for a signed URL that expires
  // in an hour. Rows whose photo can't be signed simply show no photo.
  const historyRows = historyRes.data || [];
  const paths = [...new Set(historyRows.map((h) => rewardPhotoPath(h.photo_url)).filter(Boolean))];
  const signedByPath = {};
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from(REWARD_PHOTO_BUCKET)
      .createSignedUrls(paths, 3600);
    (signed || []).forEach((s) => {
      if (s?.path && s?.signedUrl) signedByPath[s.path] = s.signedUrl;
    });
  }
  const history = historyRows.map((h) => {
    const path = rewardPhotoPath(h.photo_url);
    return { ...h, photo_url: path ? signedByPath[path] || null : null };
  });

  return (
    <>
      <DocTitle k="ui.titleRewards" />
      <RewardsClient
      initialPoints={profileRes.data?.total_points ?? 0}
      rewards={rewardsRes.data || []}
      history={history}
    />
    </>
  );
}
