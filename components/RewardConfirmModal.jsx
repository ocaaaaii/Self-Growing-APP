"use client";

import Modal from "./Modal";
import Mochi from "./Mochi";
import { useLocale } from "@/components/LocaleProvider";

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
  const { t } = useLocale();
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
            {t("rewardConfirm.soldOut_title")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
            <strong className="text-cocoa-deep">{reward?.title}</strong>{" "}
            {t("rewardConfirm.soldOut_body")}
          </p>
          <button
            onClick={onClose}
            className="btn-cocoa mt-5 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft"
          >
            {t("common.ok")}
          </button>
        </>
      ) : affordable ? (
        <>
          <h2 className="text-xl font-semibold text-cocoa-deep">
            {t("rewardConfirm.affordable_title")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
            {t("rewardConfirm.want_to_redeem")} <strong className="text-cocoa-deep">{reward?.title}</strong>
            <br />
            {t("rewardConfirm.affordable_msg")}
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
              {t("rewardConfirm.affordable_cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="rounded-2xl py-3.5 text-sm font-semibold text-cream-card shadow-soft disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
            >
              {busy ? t("rewardConfirm.confirming") : t("rewardConfirm.affordable_confirm")}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-cocoa-deep">{t("rewardConfirm.notAffordable_title")}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
            <strong className="text-cocoa-deep">{reward?.title}</strong> {t("rewardConfirm.needs")} {reward?.point_cost} pt。
            <br />
            {t("rewardConfirm.notAffordable_msg")}
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft"
            style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
          >
            {t("rewardConfirm.notAffordable_btn")}
          </button>
        </>
      )}
    </Modal>
  );
}
