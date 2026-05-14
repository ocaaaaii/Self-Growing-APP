"use client";

import { usePathname, useRouter } from "next/navigation";

// Phase 1 ships 首頁 + 習慣. 規則 / 獎勵 / 成長 are shown but
// marked "之後" (coming soon) so the layout already feels complete.
const ITEMS = [
  { key: "home", label: "首頁", href: "/home", ready: true },
  { key: "habits", label: "習慣", href: "/habits", ready: true },
  { key: "ifthen", label: "規則", href: "/ifthen", ready: false },
  { key: "rewards", label: "獎勵", href: "/rewards", ready: false },
  { key: "growth", label: "成長", href: "/growth", ready: false },
];

function Icon({ name, active }) {
  const stroke = active ? "#5C4332" : "#B89478";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };
  if (name === "home")
    return (
      <svg {...common}>
        <path
          d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-3v-7H8v7H5a2 2 0 01-2-2v-9z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "habits")
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="16" rx="3" stroke={stroke} strokeWidth="1.8" />
        <path
          d="M9 12l2 2 4-4"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 2v4M16 2v4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (name === "ifthen")
    return (
      <svg {...common}>
        <path
          d="M6 4v6c0 2 2 4 4 4h8M18 14l-3-3M18 14l-3 3"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="4" r="1.5" fill={stroke} />
      </svg>
    );
  if (name === "rewards")
    return (
      <svg {...common}>
        <path d="M4 8h16v12H4z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M2 8h20v4H2z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 8v12" stroke={stroke} strokeWidth="1.8" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={stroke} strokeWidth="1.8" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1" fill={stroke} />
      <circle cx="12" cy="14" r="1" fill={stroke} />
      <circle cx="16" cy="14" r="1" fill={stroke} />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="absolute bottom-0 left-0 right-0 grid grid-cols-5 gap-1 border-t border-line/60 bg-cream-paper/95 px-4 pb-6 pt-3 backdrop-blur">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <button
            key={it.key}
            onClick={() => {
              if (it.ready) router.push(it.href);
            }}
            className={`flex flex-col items-center gap-1 rounded-lg py-1 transition ${
              it.ready ? "" : "opacity-40"
            }`}
          >
            <span className={active ? "rounded-lg bg-beige p-1" : "p-1"}>
              <Icon name={it.key} active={active} />
            </span>
            <span
              className={`text-[10px] font-medium ${
                active ? "text-cocoa-deep" : "text-milktea"
              }`}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
