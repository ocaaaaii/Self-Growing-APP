export default function HabitsLoading() {
  return (
    <div className="animate-pulse px-[22px] pb-[100px] pt-5">
      {/* title */}
      <div className="mb-1 h-6 w-36 rounded-full bg-milktea-soft/50" />
      <div className="mb-5 h-3.5 w-48 rounded-full bg-milktea-soft/30" />

      {/* filter chips */}
      <div className="mb-5 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-milktea-soft/40" />
        ))}
      </div>

      {/* habit rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-3 flex items-center gap-3 rounded-[18px] bg-milktea-soft/25 px-4 py-3.5">
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-milktea-soft/50" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/3 rounded-full bg-milktea-soft/50" />
            <div className="h-2.5 w-1/3 rounded-full bg-milktea-soft/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
