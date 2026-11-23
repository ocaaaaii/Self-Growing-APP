import Link from "next/link";

// Shared shell for /privacy and /terms: public, static, readable on a phone.
export default function LegalPage({ title, updated, children }) {
  return (
    <main className="min-h-screen bg-cream-bg px-5 py-10 text-cocoa-deep">
      <article className="mx-auto max-w-[640px] rounded-[24px] bg-cream-card px-6 py-8 shadow-soft">
        <p className="font-hand text-lg text-muted">Mochi 慢慢變好</p>
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-xs text-muted">最後更新：{updated}</p>
        <div className="legal mt-6 space-y-6 text-[15px] leading-relaxed">{children}</div>
        <nav className="mt-8 flex flex-wrap gap-4 border-t border-line/60 pt-5 text-sm">
          <Link href="/welcome" className="text-accent underline underline-offset-4">回到首頁</Link>
          <Link href="/privacy" className="text-accent underline underline-offset-4">隱私權政策</Link>
          <Link href="/terms" className="text-accent underline underline-offset-4">服務條款</Link>
          <Link href="/feedback" className="text-accent underline underline-offset-4">意見回饋</Link>
        </nav>
      </article>
    </main>
  );
}

export function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}
