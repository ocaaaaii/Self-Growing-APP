import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  // Run on all routes except static assets and the image file
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|mochi.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
