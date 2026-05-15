"use client";

import Modal from "./Modal";
import Mochi from "./Mochi";

// Confirm redeeming a reward — "你值得"
export default function RewardConfirmModal({
  open,
  onClose,
  reward,
  affordable,
  soldOut,
  busy,
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onClose} className="text-center">
      <button
        onClick={onClose}
        className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
      >
        ✕
      </button>

      <div className="mx-auto mb-3.5 mt-2 animate-bounceIn" style={{ width: 110 }}>
        <Mochi mood={affordable ? "loving" : "sad"} size={110} />
      </div>

      {soldOut ? (
        <>
          <h2 className="text-xl font-semibold text-cocoa-deep">
            這個獎勵換完囉
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
            <strong className="text-cocoa-deep">{reward?.title}</strong>{" "}
            已經換完了。
            <br />
            可以到「我的小空間」之外，新增更多獎勵給自己 🎀
          </p>
          <button
            onClick={onClose}
            className="btn-cocoa mt-5 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft"
          >
            好的
          </button>
        </>
      ) : affordable ? (
        <>
          <h2 className="text-xl font-semibold text-cocoa-deep">
            你<span className="underline-cute">值得</span> 🎀
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
            要兌換 <strong className="text-cocoa-deep">{reward?.title}</strong> 嗎？
            <br />
            你有努力，所以你值得寵愛自己。
          </p>
          {reward?.description && (
            <p className="mt-2 text-xs italic text-milktea">
              「{reward.description}」
            </p>
          )}
          <div
            className="my-4 inline-block rounded-[18px] px-[22px] py-1.5 font-hand text-[28px] font-bold text-cocoa-deep"
            style={{ background: "linear-gradient(135deg, rgb(var(--c-butter)), rgb(var(--c-beige)))" }}
          >
            - {reward?.point_cost} pt
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onClose}
              className="rounded-2xl bg-beige py-3.5 text-sm font-semibold text-cocoa"
            >
              再想想
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="rounded-2xl py-3.5 text-sm font-semibold text-cream-card shadow-soft disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
            >
              {busy ? "兌換中…" : "兌換它！"}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-cocoa-deep">再一點點就到了</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
            <strong className="text-cocoa-deep">{reward?.title}</strong> 需要{" "}
            {reward?.point_cost} pt。
            <br />
            mochi 相信你，再完成幾件小事就可以了 🌱
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft"
            style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
          >
            好，我再加油
          </button>
        </>
      )}
    </Modal>
  );
}
