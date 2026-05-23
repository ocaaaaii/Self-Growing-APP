// Skeleton shown by Next.js while the home page server component loads
export default function HomeLoading() {
  return (
    <div className="animate-pulse px-[22px] pb-[100px] pt-5">
      {/* greeting */}
      <div className="mb-5">
        <div className="h-4 w-24 rounded-full bg-milktea-soft/50" />
        <div className="mt-2 h-7 w-40 rounded-full bg-milktea-soft/40" />
      </div>

      {/* points card */}
      <div className="mb-5 h-[72px] rounded-[20px] bg-milktea-soft/30" />

      {/* habit list header */}
      <div className="mb-3 h-4 w-28 rounded-full bg-milktea-soft/40" />

      {/* habit cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-3 flex items-center gap-3 rounded-[18px] bg-milktea-soft/25 px-4 py-3.5">
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-milktea-soft/50" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded-full bg-milktea-soft/50" />
            <div className="h-2.5 w-1/2 rounded-full bg-milktea-soft/30" />
          </div>
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-milktea-soft/40" />
        </div>
      ))}

      {/* gratitude card placeholder */}
      <div className="mt-4 h-[100px] rounded-[20px] bg-milktea-soft/20" />
    </div>
  );
}
