import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import Clock from "@/components/Clock";
import Fab from "@/components/Fab";
import ThemeApplier from "@/components/ThemeApplier";

// Shared shell for the logged-in app.
// Fixed-size phone frame: status bar (top) + scrolling content + bottom nav.
// Route group "(app)" — does not change URLs (/home, /habits stay as-is).
export default async function AppLayout({ children }) {
  // load the user's chosen theme
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let theme = "oat";
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", user.id)
      .maybeSingle();
    theme = data?.theme || "oat";
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6">
      <ThemeApplier theme={theme} />
      <div className="paper relative flex h-[820px] w-[390px] flex-col overflow-hidden rounded-[36px] shadow-[0_8px_32px_rgba(40,30,22,0.22)]">
        {/* status bar — fixed at top */}
        <div className="flex flex-shrink-0 items-center justify-between px-6 pb-1.5 pt-3.5 text-[13px] font-semibold text-cocoa">
          <Clock />
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-cocoa" />
            <span className="h-1 w-1 rounded-full bg-cocoa" />
            <span className="ml-1 text-[11px]">📶</span>
          </div>
        </div>

        {/* page content — scrolls independently */}
        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>

        {/* floating add button — stays fixed above the nav */}
        <Fab />

        {/* bottom nav — fixed at bottom */}
        <BottomNav />
      </div>
    </main>
  );
}
