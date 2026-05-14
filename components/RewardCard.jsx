"use client";

const IMG_BG = {
  小確幸: "#E8D5C8",
  物品: "#C5CDB0",
  體驗: "#E8D8A8",
  大獎勵: "#C5D2D6",
};

// One reward in the 2-column grid.
export default function RewardCard({ reward, points, onClick }) {
  const affordable = points >= reward.point_cost;
  const progress = Math.min(100, Math.round((points / reward.point_cost) * 100));
  const bg = IMG_BG[reward.category] || "#E8D5C8";

  return (
    <div
      onClick={() => onClick(reward, affordable)}
      className={`relative cursor-pointer rounded-[18px] border border-line/40 bg-cream-card p-3 text-center shadow-soft transition active:scale-[0.98] ${
        affordable ? "hover:-translate-y-0.5 hover:shadow-lift" : ""
      }`}
    >
      <div
        className={`mb-2.5 flex aspect-square items-center justify-center rounded-[14px] text-[38px] ${
          affordable ? "" : "opacity-50 grayscale-[0.4]"
        }`}
        style={{ background: bg }}
      >
        {reward.emoji}
      </div>
      <div
        className={`mb-1 text-[13px] font-semibold ${
          affordable ? "text-cocoa-deep" : "text-milktea"
        }`}
      >
        {reward.title}
      </div>
      <div className="text-xs font-bold text-cocoa">{reward.point_cost} pt</div>

      {!affordable && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-beige">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#B89478,#D4A89E)",
            }}
          />
        </div>
      )}
      {reward.redeemed_count > 0 && (
        <div className="mt-1.5 text-[10px] text-milktea">
          已兌換 {reward.redeemed_count} 次
        </div>
      )}
    </div>
  );
}
