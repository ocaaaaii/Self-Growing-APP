import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST here to sign out and bounce back to /login
export async function POST(request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
}
