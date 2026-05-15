"use client";

import { useState } from "react";

// 每日感恩三件事 — 三格輸入，三件都填完才能送出。
export default function GratitudeCard({ quote, todayEntry, onSave, saving }) {
  const done = !!todayEntry;
  const [items, setItems] = useState([
    todayEntry?.item_1 || "",
    todayEntry?.item_2 || "",
    todayEntry?.item_3 || "",
  ]);

  const allFilled = items.every((v) => v.trim().length > 0);

  function setItem(i, v) {
    setItems((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl2 border border-line/50 p-[18px] shadow-soft"
      style={{
        background: done
          ? "linear-gradient(135deg, rgb(var(--c-sage) / 0.45) 0%, rgb(var(--c-sage) / 0.65) 100%)"
          : "linear-gradient(135deg, rgb(var(--c-cream-card)) 0%, rgb(var(--c-beige) / 0.55) 100%)",
      }}
    >
      <div className="absolute right-4 top-3 rotate-12 text-[22px] opacity-50">
        🌿
      </div>

      <div className="mb-3.5 pr-7 font-hand text-[15px] leading-snug text-cocoa-soft">
        {done ? (
          <span className="font-semibold text-cocoa">
            ✓ 已完成今日感恩 ·{" "}
          </span>
        ) : null}
        「{quote}」
      </div>

      {[0, 1, 2].map((i) => (
        <div key={i} className="mb-2.5 flex items-center gap-2.5">
          <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-beige font-hand text-[11px] font-bold text-cocoa">
            {i + 1}
          </span>
          <input
            value={items[i]}
            disabled={done || saving}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder="今天我感謝..."
            className="flex-1 border-b-[1.5px] border-dashed border-line bg-transparent px-0.5 py-1.5 text-[13px] text-cocoa-deep italic outline-none placeholder:text-milktea focus:border-cocoa-soft disabled:opacity-80"
          />
        </div>
      ))}

      {!done && (
        <button
          onClick={() => onSave(items)}
          disabled={!allFilled || saving}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[13px] font-semibold transition ${
            allFilled && !saving
              ? "btn-gratitude shadow-soft hover:-translate-y-px"
              : "cursor-not-allowed bg-beige text-milktea"
          }`}
        >
          <span>🌱</span>
          {saving ? "記下中…" : "記下今天的感恩 · +20 pt"}
        </button>
      )}
    </div>
  );
}
