"use client";

import { useState } from "react";
import Modal from "./Modal";
import Bow from "./Bow";
import { REWARD_CATEGORIES, REWARD_EMOJI_CHOICES } from "@/lib/constants";

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-[7px] text-xs font-medium transition ${
        active
          ? "border-cocoa bg-cocoa text-cream-card"
          : "border-line bg-cream-card text-cocoa"
      }`}
    >
      {children}
    </button>
  );
}

const COST_PRESETS = [100, 200, 350, 500, 800, 1200];
// null = 無限
const STOCK_PRESETS = [null, 1, 3, 5, 10];

export default function AddRewardModal({ open, onClose, onSave, saving }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(REWARD_EMOJI_CHOICES[0]);
  const [category, setCategory] = useState(REWARD_CATEGORIES[0]);
  const [cost, setCost] = useState(200);
  const [stock, setStock] = useState(null); // null = 無限
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setEmoji(REWARD_EMOJI_CHOICES[0]);
    setCategory(REWARD_CATEGORIES[0]);
    setCost(200);
    setStock(null);
    setDescription("");
  }

  function handleSave() {
    onSave({
      title: title.trim() || "想要的獎勵",
      emoji,
      category,
      point_cost: Math.max(1, Number(cost) || 1),
      stock: stock === null ? null : Math.max(1, Number(stock) || 1),
      description: description.trim() || null,
    });
    reset();
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
        <Bow size={20} /> 新增一個獎勵
      </h2>
      <p className="mb-[18px] text-xs text-milktea">你有努力，所以你值得 🎀</p>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          名稱
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：去咖啡廳坐一個下午"
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          挑一個圖示
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REWARD_EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl border text-lg transition ${
                emoji === e ? "border-cocoa bg-cocoa" : "border-line bg-cream-card"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          分類
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REWARD_CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          需要的點數
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
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          可兌換數量
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STOCK_PRESETS.map((s) => (
            <Pill
              key={s === null ? "inf" : s}
              active={stock === s}
              onClick={() => setStock(s)}
            >
              {s === null ? "無限" : `${s} 次`}
            </Pill>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-milktea">
          設定後，每兌換一次就會少一個，換完就會休息
        </p>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          備註（可選）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="想對未來的自己說的話…"
          className="min-h-[60px] w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-cocoa mt-2 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? "加入中…" : "加入獎勵清單 🎀"}
      </button>
    </Modal>
  );
}
