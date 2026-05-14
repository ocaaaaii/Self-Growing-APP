"use client";

// Floating action button — bottom-right "+"
export default function Fab({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-[92px] right-[22px] z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full text-[26px] text-cream-card shadow-lift transition hover:scale-110 hover:rotate-90"
      style={{
        background: "linear-gradient(135deg,#A47854,#8B5E3F)",
        boxShadow: "0 6px 20px rgba(92,67,50,0.35)",
      }}
      aria-label="新增"
    >
      +
    </button>
  );
}
