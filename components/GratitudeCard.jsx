"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import Icon from "./Icon";

// 每日感恩三件事 — 三格輸入，三件都填完才能送出。
export default function GratitudeCard({ quote, todayEntry, onSave, saving }) {
  const { t } = useLocale();
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
      <Icon name="leaf" size={22} className="absolute right-4 top-3 rotate-12 text-accent opacity-40" />

      <div className="mb-3.5 pr-7 font-hand text-[15px] leading-snug text-muted">
        {done ? (
          <span className="font-semibold text-accent">
            {t("gratitude.done")}{" "}
          </span>
        ) : null}
        「{quote}」
      </div>

      {[0, 1, 2].map((i) => (
        <div key={i} className="mb-2.5 flex items-center gap-2.5">
          <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-beige font-hand text-xs font-bold text-accent">
            {i + 1}
          </span>
          <input
            value={items[i]}
            disabled={done || saving}
            onChange={(e) => setItem(i, e.target.value)}
            aria-label={`感恩的事 ${i + 1}`}
            placeholder={t("gratitude.placeholder")}
            className="flex-1 border-b-[1.5px] border-dashed border-line bg-transparent px-0.5 py-2 text-[15px] text-cocoa-deep outline-none placeholder:text-muted focus:border-cocoa-soft disabled:opacity-80"
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
              : "cursor-not-allowed bg-beige text-muted"
          }`}
        >
          <Icon name="sprout" size={16} />
          {saving ? t("gratitude.saving") : t("gratitude.save")}
        </button>
      )}
    </div>
  );
}
