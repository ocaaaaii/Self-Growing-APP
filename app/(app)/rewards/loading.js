export default function RewardsLoading() {
  return (
    <div className="animate-pulse px-[22px] pb-[100px] pt-5">
      {/* title */}
      <div className="mb-1 h-6 w-28 rounded-full bg-milktea-soft/50" />
      <div className="mb-5 h-3.5 w-40 rounded-full bg-milktea-soft/30" />

      {/* filter chips */}
      <div className="mb-5 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-milktea-soft/40" />
        ))}
      </div>

      {/* reward grid (2 columns) */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[18px] bg-milktea-soft/25 p-4">
            <div className="mb-2 h-10 w-10 rounded-full bg-milktea-soft/50" />
            <div className="mb-1.5 h-3.5 w-3/4 rounded-full bg-milktea-soft/50" />
            <div className="h-2.5 w-1/2 rounded-full bg-milktea-soft/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
