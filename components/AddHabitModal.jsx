"use client";

import { useState } from "react";
import Modal from "./Modal";
import Bow from "./Bow";
import { DIFFICULTY, CATEGORIES, FREQUENCIES, EMOJI_CHOICES } from "@/lib/constants";

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

export default function AddHabitModal({ open, onClose, onSave, saving }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [diffIdx, setDiffIdx] = useState(0);
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);

  function reset() {
    setName("");
    setEmoji(EMOJI_CHOICES[0]);
    setCategory(CATEGORIES[0]);
    setDiffIdx(0);
    setFrequency(FREQUENCIES[0]);
  }

  function handleSave() {
    const d = DIFFICULTY[diffIdx];
    onSave({
      title: name.trim() || "新的小事",
      emoji,
      category,
      difficulty: d.label,
      point_value: d.points,
      frequency,
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
        <Bow size={20} /> 新增一件小事
      </h2>
      <p className="mb-[18px] text-xs text-milktea">慢慢養成喜歡的自己 🌱</p>

      {/* name */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          名稱
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：睡前 10 分鐘冥想"
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      {/* emoji */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          挑一個圖示
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl border text-lg transition ${
                emoji === e
                  ? "border-cocoa bg-cocoa"
                  : "border-line bg-cream-card"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* category */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          分類
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Pill>
          ))}
        </div>
      </div>

      {/* difficulty */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          難易度 / 點數
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY.map((d, i) => (
            <Pill key={d.label} active={diffIdx === i} onClick={() => setDiffIdx(i)}>
              {d.label} · {d.points}pt
            </Pill>
          ))}
        </div>
      </div>

      {/* frequency */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          頻率
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FREQUENCIES.map((f) => (
            <Pill key={f} active={frequency === f} onClick={() => setFrequency(f)}>
              {f}
            </Pill>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-2 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#A47854,#8B5E3F)" }}
      >
        {saving ? "加入中…" : "加入我的小事 ✨"}
      </button>
    </Modal>
  );
}
