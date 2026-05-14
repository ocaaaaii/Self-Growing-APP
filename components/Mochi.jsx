"use client";

// Mochi — the app mascot 🐻
// mood: "happy" | "loving" | "cheer" | "sleepy" | "sad" | "calm"
// size: width in px (height auto-scales to the image ratio)
export default function Mochi({ mood = "happy", size = 72, className = "" }) {
  const h = Math.round(size * 0.88);
  const cheekW = size * 0.15;
  const cheekH = cheekW * 0.7;

  return (
    <div
      className={`mochi-wrap ${className}`}
      data-mood={mood}
      style={{ width: size, height: h }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mochi.png" alt="Mochi" />

      {/* signature pink cheeks */}
      <div
        className="cheek"
        style={{
          width: cheekW,
          height: cheekH,
          top: h * 0.6,
          left: size * 0.18,
        }}
      />
      <div
        className="cheek"
        style={{
          width: cheekW,
          height: cheekH,
          top: h * 0.6,
          right: size * 0.18,
        }}
      />

      {/* expression overlays — CSS shows the right one based on data-mood */}
      <div className="overlay sparkle" style={{ fontSize: size * 0.22 }}>
        ✨
      </div>
      <div className="overlay heart" style={{ fontSize: size * 0.24 }}>
        💕
      </div>
      <div className="overlay zzz" style={{ fontSize: size * 0.26 }}>
        zz
      </div>
      <div className="overlay tear" style={{ fontSize: size * 0.16 }}>
        💧
      </div>
    </div>
  );
}
