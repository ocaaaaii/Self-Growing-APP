"use client";

import { useState } from "react";
import Modal from "./Modal";
import Mochi from "./Mochi";

export default function ReflectionModal({
  open,
  onClose,
  onSave,
  saving,
  incompleteHabits,
  isYesterday = false,   // true = 補昨天的復盤
}) {
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

  const title = isYesterday ? "補一下昨天的復盤 🌙" : "今天的復盤時間 🌙";
  const subtitle = isYesterday
    ? "昨天有一些事沒做完，現在補上也不晚。"
    : "不是找藉口，是對自己 100% 誠實。";
  const placeholder = isYesterday
    ? "昨天發生了什麼？也許太累，也許被打斷了…誠實說就好，mochi 不評判 🌿"
    : "也許是太累了，也許被什麼事情打斷了…誠實說就好，mochi 不會評判你的 🌿";
  const incompleteLabel = isYesterday ? "昨天還沒完成的" : "今天還沒完成的";

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
            誠實就是成長的開始。
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
          {isYesterday ? "昨天為什麼沒做到？" : "今天為什麼沒做到？"}
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
          誠實面對自己，完成復盤可以得到{" "}
          <span className="font-semibold text-cocoa-deep">+10 pt</span>
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !text.trim()}
        className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? "記錄中…" : "完成復盤 🌿"}
      </button>

      <button
        onClick={handleClose}
        className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
      >
        先跳過
      </button>
    </Modal>
  );
}
