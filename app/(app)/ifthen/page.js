import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocTitle from "@/components/DocTitle";
import IfThenClient from "@/components/IfThenClient";

export const metadata = { title: "規則" };

export default async function IfThenPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rules } = await supabase
    .from("ifthen_rules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <>
      <DocTitle k="ui.titleIfthen" />
      <IfThenClient rules={rules || []} />
    </>;
}
