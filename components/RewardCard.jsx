"use client";

const IMG_BG = {
  小確幸: "bg-dusty",
  物品: "bg-sage",
  體驗: "bg-butter",
  大獎勵: "bg-sky",
};

// One reward in the 2-column grid.
export default function RewardCard({ reward, points, onClick }) {
  // stock: null = unlimited; 0 = sold out
  const soldOut = reward.stock !== null && reward.stock !== undefined && reward.stock <= 0;
  const affordable = !soldOut && points >= reward.point_cost;
  const progress = Math.min(100, Math.round((points / reward.point_cost) * 100));
  const bgClass = IMG_BG[reward.category] || "bg-dusty";

  return (
    <div
      onClick={() => onClick(reward)}
      className={`relative cursor-pointer rounded-[18px] border border-line/40 bg-cream-card p-3 text-center shadow-soft transition active:scale-[0.98] ${
        affordable ? "hover:-translate-y-0.5 hover:shadow-lift" : ""
      }`}
    >
      {/* stock badge */}
      {reward.stock !== null && reward.stock !== undefined && (
        <div
          className={`absolute right-2 top-2 z-[1] rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
            soldOut
              ? "bg-milktea-soft text-milktea"
              : "bg-cocoa text-cream-card"
          }`}
        >
          {soldOut ? "已換完" : `剩 ${reward.stock}`}
        </div>
      )}

      <div
        className={`mb-2.5 flex aspect-square items-center justify-center rounded-[14px] text-[38px] ${bgClass} ${
          affordable ? "" : "opacity-50 grayscale-[0.4]"
        }`}
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

      {!affordable && !soldOut && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-beige">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgb(var(--c-milktea)), rgb(var(--c-dusty)))",
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
