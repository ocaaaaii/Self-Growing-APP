"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

function Icon({ name, active }) {
  const stroke = active ? "rgb(var(--c-cocoa-deep))" : "rgb(var(--c-text-muted))";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
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
  const { t } = useLocale();

  const ITEMS = [
    { key: "home", label: t("nav.home"), href: "/home" },
    { key: "habits", label: t("nav.habits"), href: "/habits" },
    { key: "ifthen", label: t("nav.rules"), href: "/ifthen" },
    { key: "rewards", label: t("nav.rewards"), href: "/rewards" },
    { key: "growth", label: t("nav.growth"), href: "/growth" },
  ];

  return (
    <nav
      aria-label={t("ui.mainNav")}
      className="grid flex-shrink-0 grid-cols-5 gap-1 border-t border-line/60 bg-cream-paper/95 px-3 pt-2 backdrop-blur"
      style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
    >
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.key}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl py-1 outline-none transition focus-visible:ring-2 focus-visible:ring-cocoa/50"
          >
            <span className={`rounded-lg px-3 py-1 transition ${active ? "bg-beige" : ""}`}>
              <Icon name={it.key} active={active} />
            </span>
            <span
              className={`text-xs ${
                active ? "font-semibold text-cocoa-deep" : "font-medium text-muted"
              }`}
            >
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
