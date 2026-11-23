"use client";

import { useState, useEffect } from "react";
import Modal, { CloseButton } from "./Modal";
import Bow from "./Bow";
import { REWARD_CATEGORIES, REWARD_EMOJI_CHOICES } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";
import Icon from "./Icon";
import { iconFor, uniqueIconChoices } from "@/lib/icons";

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-[7px] text-xs font-medium transition ${
        active
          ? "border-cocoa bg-cocoa text-cream-card"
          : "border-line bg-cream-card text-accent"
      }`}
    >
      {children}
    </button>
  );
}

const COST_PRESETS = [100, 200, 350, 500, 800, 1200];
// null = 無限
const STOCK_PRESETS = [null, 1, 3, 5, 10];

// Add OR edit a reward. Pass `reward` to edit, omit to add.
// Pass `defaultCategory` to pre-select a category when adding.
export default function AddRewardModal({
  open,
  onClose,
  onSave,
  onDelete,
  reward,
  saving,
  defaultCategory,
}) {
  const { t } = useLocale();
  const editing = !!reward;
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(REWARD_EMOJI_CHOICES[0]);
  const [category, setCategory] = useState(REWARD_CATEGORIES[0]);
  const [cost, setCost] = useState(200);
  const [stock, setStock] = useState(null);
  const [description, setDescription] = useState("");

  // sync form when opening (for both add & edit)
  useEffect(() => {
    if (!open) return;
    if (reward) {
      setTitle(reward.title || "");
      setEmoji(reward.emoji || REWARD_EMOJI_CHOICES[0]);
      setCategory(reward.category || REWARD_CATEGORIES[0]);
      setCost(reward.point_cost ?? 200);
      setStock(reward.stock ?? null);
      setDescription(reward.description || "");
    } else {
      setTitle("");
      setEmoji(REWARD_EMOJI_CHOICES[0]);
      // 如果從已選分類的頁面開啟，預設選那個分類
      setCategory(defaultCategory && REWARD_CATEGORIES.includes(defaultCategory)
        ? defaultCategory
        : REWARD_CATEGORIES[0]);
      setCost(200);
      setStock(null);
      setDescription("");
    }
  }, [open, reward]);

  function handleSave() {
    onSave({
      title: title.trim() || "想要的獎勵",
      emoji,
      category,
      point_cost: Math.max(1, Number(cost) || 1),
      stock: stock === null ? null : Math.max(1, Number(stock) || 1),
      description: description.trim() || null,
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <CloseButton onClick={onClose} />

      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
        <Bow size={20} /> {editing ? t("addReward.titleEdit") : t("addReward.titleAdd")}
      </h2>
      <p className="mb-[18px] text-xs text-muted">{t("addReward.subtitle")}</p>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
          {t("addReward.name")}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("addReward.namePlaceholder")}
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
          {t("addReward.emoji")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {uniqueIconChoices(REWARD_EMOJI_CHOICES).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-pressed={iconFor(emoji) === iconFor(e)}
              aria-label={iconFor(e)}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50 ${
                iconFor(emoji) === iconFor(e) ? "border-cocoa bg-cocoa text-cream-card" : "border-line bg-cream-card text-cocoa-deep"
              }`}
            >
              <Icon name={iconFor(e)} size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
          {t("addReward.category")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REWARD_CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {t(`rewardCategories.${c}`) || c}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
          {t("addReward.cost")}
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {COST_PRESETS.map((c) => (
            <Pill key={c} active={cost === c} onClick={() => setCost(c)}>
              {c} pt
            </Pill>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
          {t("addReward.stock")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STOCK_PRESETS.map((s) => (
            <Pill
              key={s === null ? "inf" : s}
              active={stock === s}
              onClick={() => setStock(s)}
            >
              {s === null ? t("addReward.stock_unlimited") : `${s} ${t("common.times")}`}
            </Pill>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {t("addReward.stockHint")}
        </p>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-accent">
          {t("addReward.desc")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("addReward.descPlaceholder")}
          className="min-h-[60px] w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-cocoa mt-2 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? t("common.saving") : (editing ? t("addReward.saveEdit") : t("addReward.saveAdd"))}
      </button>

      {editing && (
        <button
          onClick={() => onDelete(reward)}
          className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
        >
          {t("addReward.deleteReward")}
        </button>
      )}
    </Modal>
  );
}
