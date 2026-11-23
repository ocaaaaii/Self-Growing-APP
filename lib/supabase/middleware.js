// Session refresh + route protection helper, used by middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Routes that do NOT require login
// "/" must be public so the root page.js can decide where to redirect.
const PUBLIC_ROUTES = ["/", "/login", "/auth", "/welcome", "/reset-password", "/privacy", "/terms", "/feedback"];

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: refreshes the auth token
  // 加 timeout：如果 Supabase 專案被暫停或網路很慢，不要讓 middleware
  // 卡住 → Vercel 會回 504（MIDDLEWARE_INVOCATION_TIMEOUT）。改成
  // 1.5 秒沒回應就當作沒登入處理，使用者會被導到 /welcome，網站不會爛掉。
  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { user: null } }), ms)
      ),
    ]);

  const {
    data: { user },
  } = await withTimeout(supabase.auth.getUser(), 1500);

  const path = request.nextUrl.pathname;
  // "/" 只比對首頁本身；其他路由比對自己和子路徑（/auth → /auth/callback）。
  // 以前用 startsWith("/") 會讓所有頁面都算公開，登入檢查形同虛設。
  // /api/* 交給各 route 自己回 401 JSON，不要被導到登入頁 HTML。
  const isPublic =
    path.startsWith("/api/") ||
    PUBLIC_ROUTES.some((r) =>
      r === "/" ? path === "/" : path === r || path.startsWith(`${r}/`)
    );

  // Not logged in + trying to reach a protected page → send to /login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in + sitting on /login → send to home
  if (user && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
