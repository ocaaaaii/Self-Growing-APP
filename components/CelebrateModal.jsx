"use client";

import Modal from "./Modal";
import Mochi from "./Mochi";

// Celebration popup — Mochi bounces in, shows points earned.
export default function CelebrateModal({ open, onClose, title, message, badge, mood = "loving" }) {
  return (
    <Modal open={open} onClose={onClose} className="text-center">
      <div className="mx-auto mb-3.5 mt-2 animate-bounceIn" style={{ width: 120 }}>
        <Mochi mood={mood} size={120} />
      </div>
      <h2 className="flex items-center justify-center gap-2 text-xl font-semibold text-cocoa-deep">
        {title}
      </h2>
      {message && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">{message}</p>
      )}
      {badge && (
        <div
          className="my-4 inline-block rounded-[18px] px-[22px] py-1.5 font-hand text-[28px] font-bold text-cocoa-deep"
          style={{ background: "linear-gradient(135deg,#F4DDC0,#E8C9A0)" }}
        >
          {badge}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-2 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px"
        style={{ background: "linear-gradient(135deg,#A47854,#8B5E3F)" }}
      >
        繼續加油！
      </button>
    </Modal>
  );
}
