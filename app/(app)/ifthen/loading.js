export default function IfthenLoading() {
  return (
    <div className="animate-pulse px-[22px] pb-[100px] pt-5">
      {/* title */}
      <div className="mb-1 h-6 w-44 rounded-full bg-milktea-soft/50" />
      <div className="mb-5 h-3.5 w-52 rounded-full bg-milktea-soft/30" />

      {/* rule cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-3 rounded-[18px] bg-milktea-soft/25 px-4 py-4">
          <div className="mb-2 h-3 w-10 rounded-full bg-milktea-soft/40" />
          <div className="mb-1.5 h-4 w-3/4 rounded-full bg-milktea-soft/50" />
          <div className="h-3 w-1/2 rounded-full bg-milktea-soft/30" />
        </div>
      ))}
    </div>
  );
}
