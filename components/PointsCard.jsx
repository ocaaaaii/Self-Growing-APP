// The featured chocolate-brown points card with bow pattern 🎀
// Used on Home and (later) Rewards.
export default function PointsCard({ points = 0, todayDelta = null, compact = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl3 text-cream-card shadow-soft ${
        compact ? "px-[18px] py-[14px]" : "px-[22px] py-5"
      }`}
      style={{ background: "linear-gradient(135deg, #9A6B4E 0%, #7E563F 100%)" }}
    >
      {/* bow pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%23FAF4E8' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'><path d='M10 12 Q4 9 4 12 Q4 15 10 12 Q10 14 10 12 Q16 9 16 12 Q16 15 10 12 Z'/><circle cx='10' cy='12' r='1' fill='%23FAF4E8'/><path d='M40 42 Q34 39 34 42 Q34 45 40 42 Q40 44 40 42 Q46 39 46 42 Q46 45 40 42 Z'/><circle cx='40' cy='42' r='1' fill='%23FAF4E8'/></g></svg>\")",
          backgroundSize: "60px 60px",
        }}
      />

      {/* corner bow */}
      <svg
        className="absolute right-[18px] top-[14px] z-[2] opacity-90"
        width="26"
        height="20"
        viewBox="0 0 30 22"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 11 Q4 4 4 11 Q4 18 15 11 Q15 15 15 11 Q26 4 26 11 Q26 18 15 11 Z"
          fill="#FAF4E8"
          stroke="#FAF4E8"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="11" r="2.2" fill="#FAF4E8" />
        <path
          d="M13 13 L11 18 M17 13 L19 18"
          stroke="#FAF4E8"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="relative z-[2] text-[11px] font-medium tracking-[2px] text-cream-card/75">
        MY POINTS
      </div>
      <div
        className={`relative z-[2] font-bold text-cream-card ${
          compact ? "text-[28px]" : "text-[38px]"
        }`}
      >
        {points.toLocaleString()}
        <span className="ml-1.5 text-sm font-medium text-cream-card/75">pt</span>
      </div>

      {todayDelta !== null && todayDelta > 0 && (
        <div className="relative z-[2] mt-2 inline-flex items-center gap-1 rounded-xl bg-cream-card/20 px-2.5 py-1 text-xs font-semibold text-cream-card backdrop-blur">
          ↑ +{todayDelta} 今天賺到的
        </div>
      )}
    </div>
  );
}
