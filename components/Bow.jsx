// A little ribbon bow 🎀 — recurring decorative motif
export default function Bow({
  size = 20,
  fill = "rgb(var(--c-milktea))",
  stroke = "rgb(var(--c-cocoa))",
}) {
  return (
    <svg
      width={size}
      height={size * 0.73}
      viewBox="0 0 30 22"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M15 11 Q4 4 4 11 Q4 18 15 11 Q15 15 15 11 Q26 4 26 11 Q26 18 15 11 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="11" r="2" fill={stroke} />
    </svg>
  );
}
