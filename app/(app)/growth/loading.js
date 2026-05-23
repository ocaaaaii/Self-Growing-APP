export default function GrowthLoading() {
  return (
    <div className="animate-pulse px-[22px] pb-[100px] pt-5">
      {/* title */}
      <div className="mb-1 h-6 w-32 rounded-full bg-milktea-soft/50" />
      <div className="mb-5 h-3.5 w-44 rounded-full bg-milktea-soft/30" />

      {/* stats row */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[18px] bg-milktea-soft/25 p-4">
            <div className="mb-1.5 h-6 w-14 rounded-full bg-milktea-soft/50" />
            <div className="h-2.5 w-2/3 rounded-full bg-milktea-soft/30" />
          </div>
        ))}
      </div>

      {/* calendar grid placeholder */}
      <div className="mb-5 h-[200px] rounded-[20px] bg-milktea-soft/20" />

      {/* chart placeholder */}
      <div className="h-[120px] rounded-[20px] bg-milktea-soft/20" />
    </div>
  );
}
