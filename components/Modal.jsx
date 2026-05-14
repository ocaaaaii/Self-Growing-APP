"use client";

// Bottom-sheet style modal — slides up from the bottom of the phone frame.
export default function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="absolute inset-0 z-50 flex items-end justify-center bg-cocoa-deep/40 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.25s ease" }}
    >
      <div
        className={`relative max-h-[90%] w-full overflow-y-auto rounded-t-xl3 bg-cream-paper px-[22px] pb-7 pt-[22px] animate-slideUp no-scrollbar ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
