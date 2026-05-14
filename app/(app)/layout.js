import BottomNav from "@/components/BottomNav";

// Shared shell for the logged-in app: the phone frame + bottom nav.
// Route group "(app)" — does not change URLs (/home, /habits stay as-is).
export default function AppLayout({ children }) {
  return (
    <main className="flex min-h-screen justify-center px-3 py-6">
      <div className="paper relative w-full max-w-[390px] overflow-hidden rounded-[36px] shadow-[0_8px_32px_rgba(92,67,50,0.18)]">
        {/* status bar */}
        <div className="flex items-center justify-between px-6 pb-1.5 pt-3.5 text-[13px] font-semibold text-cocoa">
          <span>9:42</span>
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-cocoa" />
            <span className="h-1 w-1 rounded-full bg-cocoa" />
            <span className="ml-1 text-[11px]">📶</span>
          </div>
        </div>

        {/* page content — pages scroll inside here */}
        <div className="min-h-[760px]">{children}</div>

        <BottomNav />
      </div>
    </main>
  );
}
