import { createClient } from "@/lib/supabase/server";
import IfThenClient from "@/components/IfThenClient";

export default async function IfThenPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rules } = await supabase
    .from("ifthen_rules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <IfThenClient rules={rules || []} />;
}
