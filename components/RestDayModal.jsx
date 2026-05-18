"use client";

import { useState } from "react";
import Modal from "./Modal";
import Mochi from "./Mochi";

export default function RestDayModal({ open, onClose, onSave, saving }) {
  const [reason, setReason] = useState("");

  function handleSave() {
    if (!reason.trim()) return;
    onSave(reason.trim());
    setReason("");
  }

  function handleClose() {
    setReason("");
    onClose();
  }

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
            今天請假 🛁
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-milktea">
            刻意給自己休息的許可，<br />
            跟不小心忘記是完全不一樣的事。
          </p>
        </div>
      </div>

      {/* reason textarea */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          請假理由
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例如：今天身體不舒服需要好好休息、出門旅行一天、給自己的恢復日…"
          rows={4}
          className="w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm leading-relaxed text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      {/* what happens */}
      <div className="mb-4 rounded-[12px] bg-beige/60 px-3.5 py-3 text-[12px] leading-relaxed text-cocoa-soft">
        <p>✓ &nbsp;今天的習慣不計入 streak 中斷</p>
        <p>✓ &nbsp;不會觸發今晚的復盤提示</p>
        <p>✓ &nbsp;請假登記完成 <span className="font-semibold text-cocoa-deep">+5 pt</span></p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !reason.trim()}
        className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? "記錄中…" : "好好休息去 🛁"}
      </button>

      <button
        onClick={handleClose}
        className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
      >
        取消
      </button>
    </Modal>
  );
}
