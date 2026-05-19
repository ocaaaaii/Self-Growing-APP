"use client";

import { useState } from "react";
import Modal from "./Modal";
import Mochi from "./Mochi";
import { useLocale } from "@/components/LocaleProvider";

export default function ReflectionModal({
  open,
  onClose,
  onSave,
  saving,
  incompleteHabits,
  isYesterday = false,   // true = 補昨天的復盤
}) {
  const { t } = useLocale();
  const [text, setText] = useState("");

  function handleSave() {
    if (!text.trim()) return;
    onSave(text.trim());
    setText("");
  }

  function handleClose() {
    setText("");
    onClose();
  }

  const title = isYesterday ? t("reflection.title_yesterday") : t("reflection.title_today");
  const subtitle = isYesterday ? t("reflection.subtitle_yesterday") : t("reflection.subtitle_today");
  const placeholder = isYesterday ? t("reflection.placeholder_yesterday") : t("reflection.placeholder_today");
  const incompleteLabel = isYesterday ? t("reflection.incomplete_yesterday") : t("reflection.incomplete_today");

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <button
        onClick={handleClose}
        className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
      >
        ✕
      </button>

      {/* header */}
      <div className="mb-[18px] flex items-start gap-3">
        <div className="shrink-0 animate-floaty">
          <Mochi mood="happy" size={48} />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-snug text-cocoa-deep">
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-milktea">
            {subtitle}<br />
            {t("reflection.footer")}
          </p>
        </div>
      </div>

      {/* 未完成的習慣 */}
      {incompleteHabits && incompleteHabits.length > 0 && (
        <div className="mb-4 rounded-[14px] border border-line/60 bg-cream-card/60 px-3.5 py-3">
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-cocoa">
            {incompleteLabel}
          </p>
          <div className="flex flex-col gap-1.5">
            {incompleteHabits.map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-[13px] text-cocoa-deep">
                <span className="text-base">{h.emoji}</span>
                <span>{h.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* reflection textarea */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {isYesterday ? t("reflection.label_yesterday") : t("reflection.label_today")}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm leading-relaxed text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      {/* points hint */}
      <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-beige/60 px-3.5 py-2.5">
        <span className="text-base">✨</span>
        <p className="text-[12px] leading-relaxed text-cocoa-soft">
          {t("reflection.pointsHint")}
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !text.trim()}
        className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? t("common.recording") : t("reflection.save")}
      </button>

      <button
        onClick={handleClose}
        className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
      >
        {t("common.skip")}
      </button>
    </Modal>
  );
}
