"use client";

import Modal, { CloseButton } from "./Modal";
import Mochi from "./Mochi";
import Icon from "./Icon";
import { useLocale } from "@/components/LocaleProvider";

// Confirm redeeming a reward — "你值得"
export default function RewardConfirmModal({
  open,
  onClose,
  reward,
  affordable,
  soldOut,
  busy,
  points = 0,
  onConfirm,
}) {
  const { t } = useLocale();
  const cost = reward?.point_cost ?? 0;
  const after = Math.max(points - cost, 0);
  const short = Math.max(cost - points, 0);
  // "almost there" only when it's actually close
  const nearlyThere = cost > 0 && points / cost >= 0.8;
  return (
    <Modal open={open} onClose={onClose} className="text-center" label={reward?.title}>
      <CloseButton onClick={onClose} />

      <div className="mx-auto mb-3.5 mt-2 animate-bounceIn" style={{ width: 110 }}>
        <Mochi mood={affordable ? "loving" : "sad"} size={110} />
      </div>

      {soldOut ? (
        <>
          <h2 className="text-xl font-semibold text-cocoa-deep">
            {t("rewardConfirm.soldOut_title")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-accent">
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
          <p className="mt-1.5 text-[13px] leading-relaxed text-accent">
            {t("rewardConfirm.want_to_redeem")} <strong className="text-cocoa-deep">{reward?.title}</strong>
            <br />
            {t("rewardConfirm.affordable_msg")}
          </p>
          {reward?.description && (
            <p className="mt-2 text-xs italic text-muted">
              「{reward.description}」
            </p>
          )}
          <div className="my-4 rounded-[18px] bg-cream-card px-4 py-3">
            <div className="text-xs text-muted">{t("rewardConfirm.balanceLabel")}</div>
            <div className="mt-0.5 flex items-center justify-center gap-2 text-lg font-bold tabular-nums text-cocoa-deep">
              <span>{points.toLocaleString()}</span>
              <Icon name="arrowRight" size={18} className="text-muted" />
              <span>{after.toLocaleString()} pt</span>
            </div>
            <div className="mt-0.5 text-xs text-muted">{t("rewardConfirm.spend", { n: cost.toLocaleString() })}</div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onClose}
              className="rounded-2xl bg-beige py-3.5 text-sm font-semibold text-accent"
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
          <h2 className="text-xl font-semibold text-cocoa-deep">
            {nearlyThere
              ? t("rewardConfirm.notAffordable_title")
              : t("rewardConfirm.notAffordable_far", { n: short.toLocaleString() })}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-accent">
            <strong className="text-cocoa-deep">{reward?.title}</strong> {t("rewardConfirm.needs")} {cost.toLocaleString()} pt，{t("rewardConfirm.youHave", { n: points.toLocaleString() })}
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
