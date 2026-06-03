import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import Clock from "@/components/Clock";
import Fab from "@/components/Fab";
import ThemeApplier from "@/components/ThemeApplier";
import GuideButton from "@/components/GuideButton";
import { LocaleProvider } from "@/components/LocaleProvider";
import { loadMessages, DEFAULT_LOCALE } from "@/lib/i18n";

// Shared shell for the logged-in app.
// Fixed-size phone frame: status bar (top) + scrolling content + bottom nav.
// Route group "(app)" — does not change URLs (/home, /habits stay as-is).
export default async function AppLayout({ children }) {
  // load the user's chosen theme + locale
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let theme = "oat";
  let locale = DEFAULT_LOCALE;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("theme, locale")
      .eq("id", user.id)
      .maybeSingle();
    theme = data?.theme || "oat";
    locale = data?.locale || DEFAULT_LOCALE;
  }

  // Load messages server-side to avoid flash of untranslated content
  const messages = await loadMessages(locale);

  return (
    <LocaleProvider initialLocale={locale} initialMessages={messages}>
      {/* Mobile: full-screen app. Desktop (sm+): centred phone frame */}
      <main className="h-[100dvh] w-full sm:flex sm:h-auto sm:min-h-screen sm:flex-col sm:items-center sm:justify-center sm:gap-1 sm:px-3 sm:py-4">
        <ThemeApplier theme={theme} />
        <div className="paper relative flex h-full w-full flex-col overflow-hidden sm:h-[820px] sm:max-w-[390px] sm:rounded-[36px] sm:shadow-[0_8px_32px_rgba(40,30,22,0.22)]">
          {/* status bar — desktop (phone frame) only */}
          <div className="hidden flex-shrink-0 items-center justify-between px-6 pb-1.5 pt-3.5 text-[13px] font-semibold text-cocoa sm:flex">
            <Clock />
            <div className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-cocoa" />
              <span className="h-1 w-1 rounded-full bg-cocoa" />
              <span className="ml-1 text-[11px]">📶</span>
            </div>
          </div>

          {/* GuideButton renders outside the hidden status bar so it always mounts.
              It handles desktop + mobile positioning internally. */}
          <GuideButton />

          {/* page content — scrolls independently; top padding handles iOS notch on real phones */}
          <div
            className="no-scrollbar flex-1 overflow-y-auto sm:pt-0"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {children}
          </div>

          {/* floating add button */}
          <Fab />

          {/* bottom nav — sticks to bottom; includes safe-area inset on real phones */}
          <BottomNav />
        </div>

        {/* footer — desktop only, below the phone frame */}
        <p className="hidden sm:block text-center text-[10px] text-milktea/60 leading-relaxed">
          Developed by CA<br />© 2026 Mochi Self Growing · All rights reserved.
        </p>
      </main>
    </LocaleProvider>
  );
}
