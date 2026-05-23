"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Bow from "./Bow";
import { IFTHEN_CATEGORIES } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";

// Add OR edit an If→Then rule. Pass `rule` to edit, omit to add.
export default function IfThenModal({ open, onClose, onSave, onDelete, rule, saving }) {
  const { t } = useLocale();
  const editing = !!rule;
  const [ifText, setIfText] = useState("");
  const [thenText, setThenText] = useState("");
  const [category, setCategory] = useState(IFTHEN_CATEGORIES[0]);

  useEffect(() => {
    if (open) {
      setIfText(rule?.trigger_condition || "");
      setThenText(rule?.action_response || "");
      setCategory(rule?.category || IFTHEN_CATEGORIES[0]);
    }
  }, [open, rule]);

  function handleSave() {
    onSave({
      trigger_condition: ifText.trim() || "某個觸發",
      action_response: thenText.trim() || "一個好行動",
      category,
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <button
        onClick={onClose}
        className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
      >
        ✕
      </button>

      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
        <Bow size={20} /> {editing ? t("addIfthen.titleEdit") : t("addIfthen.titleAdd")}
      </h2>
      <p className="mb-[18px] text-xs text-milktea">{t("addIfthen.subtitle")}</p>

      <div className="mb-3.5">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-cocoa">
          <span className="rounded-lg bg-dusty/40 px-2 py-0.5 text-[10px] font-bold text-cocoa">
            IF
          </span>
          {t("addIfthen.ifLabel")}
        </label>
        <textarea
          value={ifText}
          onChange={(e) => setIfText(e.target.value)}
          placeholder={t("addIfthen.ifPlaceholder")}
          className="min-h-[56px] w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-cocoa">
          <span className="rounded-lg bg-sage px-2 py-0.5 text-[10px] font-bold text-cocoa">
            THEN
          </span>
          {t("addIfthen.thenLabel")}
        </label>
        <textarea
          value={thenText}
          onChange={(e) => setThenText(e.target.value)}
          placeholder={t("addIfthen.thenPlaceholder")}
          className="min-h-[56px] w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("addIfthen.category")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {IFTHEN_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-xl border px-3 py-[7px] text-xs font-medium transition ${
                category === c
                  ? "border-cocoa bg-cocoa text-cream-card"
                  : "border-line bg-cream-card text-cocoa"
              }`}
            >
              {t(`ifthenCategories.${c}`) || c}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-2 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
      >
        {saving ? t("common.saving") : editing ? t("addIfthen.saveEdit") : t("addIfthen.saveAdd")}
      </button>

      {editing && (
        <button
          onClick={() => onDelete(rule)}
          className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
        >
          {t("addIfthen.deleteRule")}
        </button>
      )}
    </Modal>
  );
}
