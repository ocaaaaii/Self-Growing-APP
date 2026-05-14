import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Root route — send people where they belong
export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  } else {
    redirect("/login");
  }
}
