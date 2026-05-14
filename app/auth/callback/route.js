import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the link people click in the confirmation email.
// Supabase redirects here with either a `code` (PKCE) or a
// `token_hash` + `type` (email confirm). We exchange it for a session.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/home";

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Something went wrong — back to login with a flag
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
